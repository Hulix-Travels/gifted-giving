import { useEffect, useState } from 'react';
import { programsAPI } from '../services/api';
import { volunteersAPI } from '../services/api';

export default function useLiveStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Fetch all programs
        const programsRes = await programsAPI.getAll({});
        const programs = programsRes.programs || [];
        // Aggregate children helped, communities, funds, countries
        let childrenHelped = 0;
        let communities = 0;
        let funds = 0;
        const countriesSet = new Set();
        programs.forEach(p => {
          childrenHelped += p.impactMetrics?.childrenHelped || 0;
          communities += p.impactMetrics?.communitiesReached || 0;
          funds += p.currentAmount || 0;
          if (p.location?.country) countriesSet.add(p.location.country);
        });
        // Fetch volunteers
        const volunteersRes = await volunteersAPI.getStats();
        const volunteers = volunteersRes.overall?.totalApplications || 0;
        setStats({
          childrenHelped,
          communities,
          funds,
          countries: countriesSet.size,
          volunteers
        });
      } catch (e) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);
  return { stats, loading };
} 