import React from 'react';
import { motion } from 'framer-motion';
import useIntakeData from '../hooks/useIntakeData';
import TopValueLeaks from './TopValueLeaks';
import RiskRadar from './RiskRadar';
import GreenRowsOpportunity from './GreenRowsOpportunity';
import TopProcesses from './TopProcesses';
import ManagerEffectiveness from './ManagerEffectiveness';
import DepartmentalCongestion from './DepartmentalCongestion';
import SuccessorReadinessMap from './SuccessorReadinessMap';
import TheMirror from './TheMirror';
import HumanCapitalBalanceSheet from './HumanCapitalBalanceSheet';
import ManagerEffectivenessScore from './ManagerEffectivenessScore';

const DeepReveals: React.FC = () => {
  const { data, loading } = useIntakeData();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-5">
      {/* Enabled Top Row: TopValueLeaks + RiskRadar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
            <TopValueLeaks data={data} />
        </div>
        <div className="lg:col-span-2">
            <RiskRadar data={data} />
        </div>
      </div>

      {/* Manager Effectiveness — live */}
      <TopProcesses />
      
      {/* Live analytics */}
      <GreenRowsOpportunity />
      {false && <SuccessorReadinessMap />}
      {false && <TheMirror />}
      <HumanCapitalBalanceSheet />
      <DepartmentalCongestion />
      <ManagerEffectiveness />
      <ManagerEffectivenessScore />
    </motion.div>
  );
};

export default DeepReveals;
