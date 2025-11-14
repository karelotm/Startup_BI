import React, { useState } from 'react';
import { Goal } from '../types';
import Modal from './Modal';
import { GoalsIcon } from './icons/GoalsIcon';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'current'>) => void;
}

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    const isRevenue = goal.type === 'revenue' || goal.type === 'profit';
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    let statusColor = 'text-green-500';
    if(progress < 50 && daysLeft < 30) statusColor = 'text-yellow-500';
    if(progress < 75 && daysLeft < 15) statusColor = 'text-red-500';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 truncate">{goal.title}</h3>
            <p className={`text-sm font-semibold ${statusColor}`}>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</p>
            
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-semibold text-sky-600">
                        {isRevenue ? `$${goal.current.toLocaleString()}` : goal.current.toLocaleString()}
                    </span>
                    <span className="text-slate-500">
                        Target: {isRevenue ? `$${goal.target.toLocaleString()}` : goal.target.toLocaleString()}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                 <p className="text-right text-xs text-slate-500 font-bold mt-1">{progress.toFixed(1)}% Complete</p>
            </div>
        </div>
    );
}

const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'revenue' | 'profit' | 'customers'>('revenue');
    const [target, setTarget] = useState('');
    const [deadline, setDeadline] = useState('');

    const resetForm = () => {
        setTitle('');
        setType('revenue');
        setTarget('');
        setDeadline('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && type && target && deadline) {
            onAddGoal({
                title,
                type,
                target: parseFloat(target),
                deadline
            });
            resetForm();
            setIsModalOpen(false);
        }
    };
    

    return (
        <>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set a New Goal">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="goal-title" className="block text-sm font-medium text-slate-700 mb-1">Goal Title</label>
                    <input type="text" id="goal-title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Q4 Revenue Target" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="goal-type" className="block text-sm font-medium text-slate-700 mb-1">Goal Type</label>
                        <select id="goal-type" value={type} onChange={e => setType(e.target.value as any)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                            <option value="revenue">Revenue</option>
                            <option value="profit">Profit</option>
                            <option value="customers">Customers</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="goal-target" className="block text-sm font-medium text-slate-700 mb-1">Target Value</label>
                        <input type="number" id="goal-target" value={target} onChange={e => setTarget(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="goal-deadline" className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                    <input type="date" id="goal-deadline" value={deadline} onChange={e => setDeadline(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600">Set Goal</button>
                </div>
            </form>
        </Modal>

        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                <div>
                <h2 className="text-3xl font-bold text-slate-800">Strategic Goals</h2>
                <p className="text-slate-500">Define and track your most important business objectives.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-600 transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Set New Goal
                </button>
            </div>
            {goals.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <GoalsIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-slate-800">No Goals Set</h3>
                    <p className="mt-1 text-sm text-slate-500">Click "Set New Goal" to define your first objective.</p>
                </div>
            )}
        </div>
        </>
    );
};

export default Goals;