import { useEffect, useState, useCallback } from 'react';
import { programsAPI, volunteersAPI } from '../services/api';

export default function useLiveStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const programsRes = await programsAPI.getAll({});
      const programs = programsRes.programs || [];
      let childrenHelped = 0;
      let communities = 0;
      let funds = 0;
      const countriesSet = new Set();
      programs.forEach((p) => {
        childrenHelped += p.impactMetrics?.childrenHelped || 0;
        communities += p.impactMetrics?.communitiesReached || 0;
        funds += p.currentAmount || 0;
        if (p.location?.country) countriesSet.add(p.location.country);
      });
      const volunteersRes = await volunteersAPI.getPublicSummary();
      const volunteers = volunteersRes.approvedApplications || volunteersRes.totalApplications || 0;
      setStats({
        childrenHelped,
        communities,
        funds,
        countries: countriesSet.size,
        volunteers
      });
    } catch {
      setStats(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
} 