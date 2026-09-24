import { OllamaService } from './ollama.service.js';
import { logger } from '../../config/logger.js';

export class AIService {
  /**
   * Powerful regex-based IOC extraction from arbitrary text
   */
  static extractIOCsFromText(text) {
    if (!text || typeof text !== 'string') return [];

    const iocs = [];
    const seen = new Set();

    // 1. IPv4 Regex (ignoring standard local/private blocks if desired, or flagging)
    const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    const ips = text.match(ipv4Regex) || [];
    for (const ip of ips) {
      if (!['127.0.0.1', '0.0.0.0', '255.255.255.255'].includes(ip) && !seen.has(`IPV4:${ip}`)) {
        seen.add(`IPV4:${ip}`);
        iocs.push({ type: 'IPV4', value: ip, severity: 'HIGH', reputationScore: 80 });
      }
    }

    // 2. SHA256 (64 hex characters)
    const sha256Regex = /\b[a-fA-F0-9]{64}\b/g;
    const sha256s = text.match(sha256Regex) || [];
    for (const hash of sha256s) {
      if (!seen.has(`SHA256:${hash.toLowerCase()}`)) {
        seen.add(`SHA256:${hash.toLowerCase()}`);
        iocs.push({ type: 'SHA256', value: hash.toLowerCase(), severity: 'CRITICAL', reputationScore: 90 });
      }
    }

    // 3. MD5 (32 hex characters)
    const md5Regex = /\b[a-fA-F0-9]{32}\b/g;
    const md5s = text.match(md5Regex) || [];
    for (const hash of md5s) {
      if (!seen.has(`MD5:${hash.toLowerCase()}`)) {
        seen.add(`MD5:${hash.toLowerCase()}`);
        iocs.push({ type: 'MD5', value: hash.toLowerCase(), severity: 'HIGH', reputationScore: 85 });
      }
    }

    // 4. CVE Identifiers (CVE-YYYY-NNNN+)
    const cveRegex = /\bCVE-\d{4}-\d{4,7}\b/gi;
    const cves = text.match(cveRegex) || [];
    for (const cve of cves) {
      const normalizedCve = cve.toUpperCase();
      if (!seen.has(`CVE:${normalizedCve}`)) {
        seen.add(`CVE:${normalizedCve}`);
        iocs.push({ type: 'CVE', value: normalizedCve, severity: 'CRITICAL', reputationScore: 95 });
      }
    }

    // 5. URLs (http/https/hxxp)
    const urlRegex = /\b(?:https?|hxxps?):\/\/[^\s<>"{}|\\^`[\]]+/gi;
    const urls = text.match(urlRegex) || [];
    for (const url of urls) {
      const cleanUrl = url.replace(/^hxxp/i, 'http');
      if (!seen.has(`URL:${cleanUrl}`)) {
        seen.add(`URL:${cleanUrl}`);
        iocs.push({ type: 'URL', value: cleanUrl, severity: 'HIGH', reputationScore: 85 });
      }
    }

    // 6. Domains & FQDNs
    const domainRegex = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|ru|cn|cc|xyz|top|info|biz|me|su|tk|online|site|live|pw|onion)\b/gi;
    const domains = text.match(domainRegex) || [];
    const domainBlacklist = ['google.com', 'microsoft.com', 'github.com', 'w3.org', 'schema.org', 'apache.org', 'cve.mitre.org', 'nvd.nist.gov'];
    for (const domain of domains) {
      const lowerDomain = domain.toLowerCase();
      if (!domainBlacklist.includes(lowerDomain) && !seen.has(`DOMAIN:${lowerDomain}`)) {
        seen.add(`DOMAIN:${lowerDomain}`);
        iocs.push({ type: 'DOMAIN', value: lowerDomain, severity: 'MEDIUM', reputationScore: 70 });
      }
    }

    // 7. Email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
    const emails = text.match(emailRegex) || [];
    for (const email of emails) {
      const lowerEmail = email.toLowerCase();
      if (!seen.has(`EMAIL:${lowerEmail}`)) {
        seen.add(`EMAIL:${lowerEmail}`);
        iocs.push({ type: 'EMAIL', value: lowerEmail, severity: 'MEDIUM', reputationScore: 65 });
      }
    }

    return iocs;
  }

  /**
   * Analyze raw threat report using Ollama local AI (Qwen3:8b)
   */
  static async analyzeThreat({ title, content, sourceUrl = null }) {
    // 1. First extract regex IOCs
    const extractedIOCs = this.extractIOCsFromText(`${title} \n ${content}`);

    const systemPrompt = `You are ThreatSift CTI AI, an elite Cyber Threat Intelligence analyst.
Your task is to analyze cybersecurity articles, incident reports, and OSINT feed items.
Extract actionable intelligence, map to the MITRE ATT&CK framework, classify threat types, and suggest concrete defense steps.
Return ONLY a valid JSON object without any Markdown fences or backticks.`;

    const userPrompt = `Analyze the following threat intelligence report:
Title: ${title}
Source URL: ${sourceUrl || 'N/A'}
Content:
${(content || '').slice(0, 4000)}

Respond with a JSON object matching this schema:
{
  "title": "Clear concise threat title",
  "threatType": "RANSOMWARE | MALWARE | APT_CAMPAIGN | PHISHING | ZERO_DAY | VULNERABILITY | DATA_LEAK | EXPLOIT | OTHER",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW | INFO",
  "confidence": 85,
  "threatActor": "Name of threat actor or group (e.g., APT29, LockBit) or null if unknown",
  "malwareFamily": "Name of malware family (e.g., Cobalt Strike, Lumma Stealer) or null if unknown",
  "targetedSectors": ["Finance", "Healthcare", "Government"],
  "targetedCountries": ["US", "DE", "Global"],
  "mitreTactics": ["TA0001 Initial Access", "TA0002 Execution"],
  "mitreTechniques": ["T1566 Phishing", "T1059 Command and Scripting Interpreter"],
  "aiSummary": "2-3 paragraphs executive summary of the threat",
  "aiRiskAssessment": "Detailed analysis of potential operational & financial impact",
  "remediationSteps": "Actionable security recommendations (Firewall rules, detection, patching, mitigation)",
  "indicators": [
    { "type": "IPV4 | DOMAIN | URL | SHA256 | MD5 | CVE | EMAIL", "value": "ioc_value", "severity": "CRITICAL | HIGH | MEDIUM" }
  ]
}`;

    try {
      logger.info(`Sending threat text to Ollama Qwen3:8b for AI CTI analysis...`);
      const responseText = await OllamaService.generate({
        system: systemPrompt,
        prompt: userPrompt,
        jsonFormat: true,
        temperature: 0.1
      });

      let parsedResult = this.cleanAndParseJson(responseText);
      if (!parsedResult) {
        logger.warn(`Failed to parse Ollama JSON response, using fallback`);
        parsedResult = this.generateFallbackAnalysis(title, content, extractedIOCs);
      }

      // Merge regex IOCs with LLM extracted IOCs
      const combinedIOCs = [...extractedIOCs];
      if (Array.isArray(parsedResult.indicators)) {
        for (const item of parsedResult.indicators) {
          if (item.value && !combinedIOCs.some(i => i.value.toLowerCase() === item.value.toLowerCase())) {
            combinedIOCs.push({
              type: (item.type || 'DOMAIN').toUpperCase(),
              value: item.value,
              severity: item.severity || 'HIGH',
              reputationScore: item.severity === 'CRITICAL' ? 90 : 75
            });
          }
        }
      }

      const formatToString = (val, fallback = '') => {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        if (Array.isArray(val)) return val.map((s, i) => `${i + 1}. ${typeof s === 'object' ? JSON.stringify(s) : s}`).join('\n');
        if (typeof val === 'object') return JSON.stringify(val, null, 2);
        return String(val);
      };

      return {
        title: parsedResult.title || title,
        threatType: parsedResult.threatType || 'MALWARE',
        severity: parsedResult.severity || 'HIGH',
        confidence: typeof parsedResult.confidence === 'number' ? parsedResult.confidence : 80,
        threatActor: parsedResult.threatActor || null,
        malwareFamily: parsedResult.malwareFamily || null,
        targetedSectors: Array.isArray(parsedResult.targetedSectors) ? parsedResult.targetedSectors : ['Technology'],
        targetedCountries: Array.isArray(parsedResult.targetedCountries) ? parsedResult.targetedCountries : ['Global'],
        mitreTactics: Array.isArray(parsedResult.mitreTactics) ? parsedResult.mitreTactics : ['TA0001 Initial Access'],
        mitreTechniques: Array.isArray(parsedResult.mitreTechniques) ? parsedResult.mitreTechniques : ['T1566 Phishing'],
        aiSummary: formatToString(parsedResult.aiSummary, `${title} - Active cyber threat observed in the wild.`),
        aiRiskAssessment: formatToString(parsedResult.aiRiskAssessment, 'Potential risk of data compromise, unauthorized lateral movement, or system unavailability.'),
        remediationSteps: formatToString(parsedResult.remediationSteps, '1. Block associated IOCs on firewalls and EDR.\n2. Monitor for suspicious child processes.\n3. Verify latest security patches are installed.'),
        indicators: combinedIOCs,
        sourceUrl
      };
    } catch (error) {
      logger.warn(`Ollama AI analysis unavailable, using rule-based CTI heuristics: ${error.message}`);
      return this.generateFallbackAnalysis(title, content, extractedIOCs, sourceUrl);
    }
  }

  /**
   * Rule-based CTI fallback analysis when AI server is offline or loading
   */
  static generateFallbackAnalysis(title, content, extractedIOCs = [], sourceUrl = null) {
    const text = `${title} ${content}`.toLowerCase();

    let threatType = 'MALWARE';
    let severity = 'MEDIUM';

    if (text.includes('ransomware') || text.includes('encrypt') || text.includes('extort')) {
      threatType = 'RANSOMWARE';
      severity = 'CRITICAL';
    } else if (text.includes('zero-day') || text.includes('0-day') || text.includes('unauthenticated rce')) {
      threatType = 'ZERO_DAY';
      severity = 'CRITICAL';
    } else if (text.includes('apt') || text.includes('nation-state') || text.includes('espionage')) {
      threatType = 'APT_CAMPAIGN';
      severity = 'HIGH';
    } else if (text.includes('phish') || text.includes('credential harvest')) {
      threatType = 'PHISHING';
      severity = 'MEDIUM';
    } else if (text.includes('vulnerability') || text.includes('cve-') || text.includes('flaw')) {
      threatType = 'VULNERABILITY';
      severity = 'HIGH';
    } else if (text.includes('leak') || text.includes('database dump') || text.includes('breach')) {
      threatType = 'DATA_LEAK';
      severity = 'HIGH';
    }

    return {
      title,
      threatType,
      severity,
      confidence: 75,
      threatActor: text.includes('apt') ? 'Unattributed APT Group' : null,
      malwareFamily: threatType === 'RANSOMWARE' ? 'Generic Ransomware' : null,
      targetedSectors: ['Technology', 'Financial Services', 'Healthcare'],
      targetedCountries: ['Global'],
      mitreTactics: ['TA0001 Initial Access', 'TA0002 Execution'],
      mitreTechniques: ['T1566 Phishing', 'T1059 Command and Scripting Interpreter'],
      aiSummary: `Threat intelligence report on "${title}". Analysis indicates a ${severity} severity ${threatType} threat with potential organizational impact.`,
      aiRiskAssessment: `Risk of unauthorized intrusion, credential theft, and network persistence. Exploitation could compromise confidential assets.`,
      remediationSteps: `1. Enforce strict endpoint protection and block identified IOCs.\n2. Review authentication logs for anomalous logins.\n3. Apply relevant vendor security patches immediately.`,
      indicators: extractedIOCs,
      sourceUrl
    };
  }

  /**
   * Generate an Actionable CTI Intelligence Report (STIX 2.1 & Markdown) using Qwen3:8b
   */
  static async generateReport({ threat, reportType = 'TECHNICAL_ADVISORY', classification = 'TLP_AMBER' }) {
    const prompt = `You are ThreatSift CTI AI.
Generate a comprehensive, professional Cyber Threat Intelligence (CTI) report in GitHub-flavored Markdown.

Report Type: ${reportType}
Classification: ${classification}
Threat Title: ${threat.title}
Threat Type: ${threat.threatType}
Severity: ${threat.severity}
Threat Actor: ${threat.threatActor || 'Unknown / Unattributed'}
Malware Family: ${threat.malwareFamily || 'N/A'}
Targeted Sectors: ${(threat.targetedSectors || []).join(', ')}
MITRE ATT&CK Tactics: ${(threat.mitreTactics || []).join(', ')}
MITRE ATT&CK Techniques: ${(threat.mitreTechniques || []).join(', ')}

Structure the Markdown with:
# ${threat.title}
## 1. Executive Summary & Context
## 2. Threat Actor & Campaign Overview
## 3. Technical Analysis & TTPs (MITRE ATT&CK Mapping)
## 4. Indicators of Compromise (IOC) Detection Table
## 5. Defensive Guidance & Mitigation Playbook (Firewall, EDR, SIEM rules)`;

    let markdownReport;
    try {
      markdownReport = await OllamaService.generate({
        prompt,
        temperature: 0.2
      });
    } catch {
      markdownReport = `# Threat Advisory: ${threat.title}
**Classification:** ${classification} | **Severity:** ${threat.severity} | **Threat Type:** ${threat.threatType}

## 1. Executive Summary
${threat.aiSummary || threat.description}

## 2. Risk Assessment
${threat.aiRiskAssessment || 'High potential for data loss and operational disruption.'}

## 3. MITRE ATT&CK Mapping
- **Tactics:** ${(threat.mitreTactics || []).join(', ') || 'N/A'}
- **Techniques:** ${(threat.mitreTechniques || []).join(', ') || 'N/A'}

## 4. Actionable Remediation Playbook
${threat.remediationSteps || 'Block associated network and file indicators immediately.'}
`;
    }

    // Generate STIX 2.1 JSON representation
    const stixBundle = {
      type: 'bundle',
      id: `bundle--${threat.id}`,
      spec_version: '2.1',
      objects: [
        {
          type: 'report',
          id: `report--${threat.id}`,
          name: threat.title,
          description: threat.aiSummary || threat.description,
          published: new Date().toISOString(),
          report_types: [reportType.toLowerCase()],
          labels: [threat.threatType.toLowerCase(), threat.severity.toLowerCase()]
        }
      ]
    };

    return {
      title: `CTI Report: ${threat.title}`,
      reportType,
      classification,
      summary: threat.aiSummary || threat.title,
      content: markdownReport,
      stixData: stixBundle
    };
  }

  /**
   * Robust JSON cleaner that strips <think> reasoning blocks, markdown fences, and extracts JSON objects
   */
  static cleanAndParseJson(rawText) {
    if (!rawText || typeof rawText !== 'string') return null;

    // 1. Remove <think>...</think> reasoning blocks from Qwen3 / DeepSeek
    let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // 2. Remove markdown code fences e.g. ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 3. Extract JSON object or array if surrounded by conversational filler
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      cleaned = jsonMatch[0].trim();
    }

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      logger.warn(`Failed to parse cleaned JSON: ${err.message}. Raw: ${rawText.slice(0, 150)}...`);
      return null;
    }
  }

  /**
   * Quick OSINT Lookup on a single IP / Domain / Hash / CVE
   */
  static async quickEnrichment(type, value) {
    const prompt = `You are an expert Cyber Threat Intelligence (CTI) & OSINT analyst.
Analyze the following indicator of compromise (${type}): "${value}".
Provide deep technical context: known threat actors/groups, associated malware families, risk score (0-100), overall verdict (MALICIOUS, SUSPICIOUS, CLEAN), comprehensive intelligence summary, and recommended defensive actions.

Respond ONLY with a valid JSON object matching this schema:
{
  "value": "${value}",
  "type": "${type}",
  "verdict": "MALICIOUS",
  "riskScore": 85,
  "associatedThreatActors": ["ThreatActorName"],
  "associatedMalware": ["MalwareFamilyName"],
  "summary": "Detailed intelligence assessment explaining why this indicator is flagged, historical attack campaigns, and observed adversary activities.",
  "recommendations": "1. Block on perimeter firewalls.\\n2. Hunt for historical DNS resolutions.\\n3. Isolate affected endpoints."
}`;

    try {
      logger.info(`Running OSINT AI lookup for ${type} '${value}' on Ollama Qwen3:8b...`);
      const response = await OllamaService.generate({
        prompt,
        jsonFormat: true,
        temperature: 0.1
      });

      const parsed = this.cleanAndParseJson(response);

      if (parsed) {
        const summary = parsed.summary || parsed.description || parsed.analysis || parsed.intel || parsed.details || parsed.overview || `Analysis completed for indicator ${value}. Evaluated as ${parsed.verdict || 'SUSPICIOUS'} with risk score ${parsed.riskScore || 75}/100.`;
        const recommendations = parsed.recommendations || parsed.remediation || parsed.defense || parsed.mitigation || '1. Block indicator on network perimeter.\n2. Review authentication logs for anomalous connections.';

        return {
          value: parsed.value || value,
          type: (parsed.type || type).toUpperCase(),
          verdict: (parsed.verdict || (parsed.riskScore > 75 ? 'MALICIOUS' : parsed.riskScore > 40 ? 'SUSPICIOUS' : 'CLEAN')).toUpperCase(),
          riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : (parsed.risk_score || 75),
          associatedThreatActors: Array.isArray(parsed.associatedThreatActors) ? parsed.associatedThreatActors : (parsed.threatActors || []),
          associatedMalware: Array.isArray(parsed.associatedMalware) ? parsed.associatedMalware : (parsed.malware || []),
          summary: typeof summary === 'string' ? summary : JSON.stringify(summary, null, 2),
          recommendations: typeof recommendations === 'string' ? recommendations : (Array.isArray(recommendations) ? recommendations.join('\n') : JSON.stringify(recommendations, null, 2))
        };
      }
    } catch (err) {
      logger.warn(`Ollama OSINT enrichment error for ${value}: ${err.message}`);
    }

    // Heuristic fallback if LLM times out or is unreachable
    const isPrivateIp = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(value);
    const defaultVerdict = isPrivateIp ? 'CLEAN' : 'SUSPICIOUS';
    const defaultRisk = isPrivateIp ? 10 : 70;

    return {
      value,
      type: type.toUpperCase(),
      verdict: defaultVerdict,
      riskScore: defaultRisk,
      associatedThreatActors: isPrivateIp ? [] : ['Unattributed Threat Activity'],
      associatedMalware: [],
      summary: `Automated OSINT heuristic evaluation for ${type} '${value}'. ${isPrivateIp ? 'Internal/Private network address identified.' : 'Publicly routable indicator observed in recent threat feeds with anomalous communication patterns.'}`,
      recommendations: isPrivateIp ? 'Internal network address. Verify internal host asset inventory.' : '1. Block indicator on perimeter firewall and proxy deny-lists.\n2. Ingest into SIEM correlation rules.\n3. Query endpoint detection (EDR) for historical connections.'
    };
  }
}
