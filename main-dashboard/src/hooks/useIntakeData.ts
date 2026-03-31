import { useState, useEffect } from 'react';

export default function useIntakeData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/intake`);
      const json = await response.json();
      if (json && Object.keys(json).length > 0) {
        setData(json);
      } else {
          setData(null);
      }
    } catch (err) {
      console.error('Failed to fetch intake data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, update: fetchData };
}
