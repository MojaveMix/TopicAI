import { Threat, Indicator, ThreatIndicator, Alert } from '../../database/models/index.js';
import { Op } from 'sequelize';
import { logger } from '../../config/logger.js';

export class CorrelationService {
  /**
   * Correlate a given threat with other threats and indicators across the platform
   */
  static async correlateThreat(threatId) {
    const threat = await Threat.findByPk(threatId, {
      include: [{ model: Indicator, as: 'indicators' }]
    });

    if (!threat) return null;

    const indicatorIds = (threat.indicators || []).map(i => i.id);
    const relatedThreatsMap = new Map();

    // 1. Correlate by Shared Indicators (IOCs)
    if (indicatorIds.length > 0) {
      const sharedLinks = await ThreatIndicator.findAll({
        where: {
          indicatorId: { [Op.in]: indicatorIds },
          threatId: { [Op.ne]: threatId }
        },
        include: [{ model: Threat, as: 'threat' }]
      });

      for (const link of sharedLinks) {
        if (!relatedThreatsMap.has(link.threatId)) {
          relatedThreatsMap.set(link.threatId, {
            threatId: link.threatId,
            matchType: 'SHARED_IOC',
            sharedCount: 1
          });
        } else {
          relatedThreatsMap.get(link.threatId).sharedCount += 1;
        }
      }
    }

    // 2. Correlate by Same Threat Actor or Malware Family
    const actorOrMalwareQuery = [];
    if (threat.threatActor) {
      actorOrMalwareQuery.push({ threatActor: threat.threatActor });
    }
    if (threat.malwareFamily) {
      actorOrMalwareQuery.push({ malwareFamily: threat.malwareFamily });
    }

    if (actorOrMalwareQuery.length > 0) {
      const relatedByTTP = await Threat.findAll({
        where: {
          id: { [Op.ne]: threatId },
          [Op.or]: actorOrMalwareQuery
        },
        limit: 10
      });

      for (const rel of relatedByTTP) {
        if (!relatedThreatsMap.has(rel.id)) {
          relatedThreatsMap.set(rel.id, {
            threatId: rel.id,
            matchType: 'SHARED_ACTOR_OR_MALWARE',
            sharedCount: 1
          });
        }
      }
    }

    const correlations = Array.from(relatedThreatsMap.values());
    if (correlations.length > 0) {
      threat.isCorrelated = true;
      await threat.save();

      // Trigger automatic high-severity alert for campaign correlation
      if (threat.severity === 'CRITICAL' || threat.severity === 'HIGH') {
        await Alert.create({
          title: `Threat Correlation Alert: ${threat.title}`,
          message: `Threat '${threat.title}' was correlated with ${correlations.length} other intelligence records sharing IOCs or TTPs.`,
          severity: threat.severity,
          alertType: 'NEW_CAMPAIGN',
          status: 'NEW',
          entityType: 'THREAT',
          entityId: threat.id,
          metadata: { correlations }
        });
      }
    }

    return {
      threatId,
      correlationsCount: correlations.length,
      correlations
    };
  }
}
