import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // your Tailwind or other CSS

// calc days between dates
function daysSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// initial demo data
const initialProjects = [
  {
    id: 'cust-a',
    name: 'Customer A',
    actionItems: [
      {
        id: 'a1',
        title: 'Configure environment',
        createdBy: 'You',
        assignedTo: 'Alice',
        tier: 'current',
        created: '2025-05-01',
        updates: [
          { type: 'update', author: 'You', content: 'Initial setup started.', date: '2025-05-05' }
        ]
      }
    ]
  }
];

function ActionCard({ item, expanded, onToggle, onSubmit, onTierChange, onComplete }) {
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [assignee, setAssignee] = useState(item.assignedTo);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const tierBtn = {
    next:    { label: 'Escalate', nextTier: 'current' },
    current: { label: 'Backlog',  nextTier: 'next'    },
    completed:{ label: 'Reopen', nextTier: 'current' }
  }[item.tier];

  const lastUpdateDays =
    item.tier === 'current' && item.updates.length
      ? daysSince(item.updates[item.updates.length - 1].date)
      : null;

  return (
    <div className={`border ${item.tier==='completed'?'border-green-300':item.tier==='current'?'border-blue-300':'border-gray-300'} shadow rounded-lg`}>
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-lg">{item.title}</div>
          <button className="px-2 py-1 border rounded" onClick={onToggle}>
            {expanded ? 'Hide' : 'View'} Updates
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Created by: <span className="font-medium">{item.createdBy}</span>
        </div>

        {lastUpdateDays != null && (
          <div className="text-xs text-blue-600">
            Last update: {lastUpdateDays} day{lastUpdateDays!==1?'s':''} ago
          </div>
        )}

        {expanded && (
          <div className="mt-3 space-y-3">
            {item.updates.map((u,i) => (
              <div key={i} className="text-sm bg-gray-50 border p-2 rounded">
                <div className="font-semibold">{u.author}</div>
                <div>{u.content}</div>
                <div className="text-xs text-gray-400">{u.date}</div>
              </div>
            ))}

            <textarea
              className="w-full border p-2"
              placeholder="Add comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />

            <input
              type="file"
              className="w-full"
              onChange={e => setFile(e.target.files?.[0]||null)}
            />

            <input
              className="w-full border p-2"
              placeholder="Change assignee"
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
            />

            <button
              className="w-full bg-blue-600 text-white py-2 rounded"
              onClick={() => onSubmit(item.id, comment, file, assignee)}
            >
              Submit Update
            </button>

            {item.tier==='current' && !confirmComplete && (
              <button
                className="w-full mt-2 bg-green-600 text-white py-2 rounded"
                onClick={() => setConfirmComplete(true)}
              >
                Complete
              </button>
            )}

            {confirmComplete && (
              <div className="flex gap-2 mt-2">
                <button
                  className="w-1/2 bg-green-600 text-white py-2 rounded"
                  onClick={() => onComplete(item.id,'done')}
                >
                  Done
                </button>
                <button
                  className="w-1/2 bg-red-600 text-white py-2 rounded"
                  onClick={() => onComplete(item.id,'cancelled')}
                >
                  Cancelled
                </button>
              </div>
            )}

            {tierBtn && item.tier!=='current' && (
              <button
                className="w-full mt-2 border py-2 rounded"
                onClick={() => onTierChange(item.id, tierBtn.nextTier)}
              >
                {tierBtn.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [projects, setProjects]         = useState(initialProjects);
  const [activeProjectId, setActive]    = useState(null);
  const [expandedId, setExpanded]       = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [newTask, setNewTask]           = useState({title:'',assignedTo:''});
  const [showSettings, setShowSettings] = useState(false);
  const [newProjectName, setNewProj]    = useState('');

  const active = projects.find(p=>p.id===activeProjectId) || null;
  const totals = active
    ? {
        current:  active.actionItems.filter(i=>i.tier==='current').length,
        next:     active.actionItems.filter(i=>i.tier==='next').length,
        completed:active.actionItems.filter(i=>i.tier==='completed').length
      }
    : {current:0,next:0,completed:0};

  const addProject = () => {
    if (!newProjectName) return;
    const id = `proj-${Date.now()}`;
    setProjects(p=>[...p,{id,name:newProjectName,actionItems:[]}]);
    setNewProj('');
  };
  const deleteProject = id => {
    setProjects(p=>p.filter(x=>x.id!==id));
    if (activeProjectId===id) setActive(null);
  };
  const addTask = () => {
    if (!newTask.title||!newTask.assignedTo) return;
    const entry = {
      id:`task-${Date.now()}`,
      title:newTask.title,
      createdBy:'You',
      assignedTo:newTask.assignedTo,
      tier:'next',
      created:new Date().toISOString().split('T')[0],
      updates:[]
    };
    setProjects(p=>p.map(x=>x.id===activeProjectId?{...x,actionItems:[...x.actionItems,entry]}:x));
    setShowModal(false);
    setNewTask({title:'',assignedTo:''});
  };
  const submitUpdate = (tid,comment,file,assignee)=>{
    setProjects(p=>p.map(proj=>{
      if(proj.id!==activeProjectId) return proj;
      const items = proj.actionItems.map(t=>{
        if(t.id!==tid) return t;
        const up = [...t.updates];
        if(comment||file) up.push({
          type:'update',author:'You',
          content:`${comment}${file?' (file attached)':''}`.trim(),
          date:new Date().toISOString().split('T')[0]
        });
        return {...t,assignedTo:assignee,updates:up};
      });
      return {...proj,actionItems:items};
    }));
  };
  const changeTier = (tid,next)=>
    setProjects(p=>p.map(proj=>{
      if(proj.id!==activeProjectId) return proj;
      const items=proj.actionItems.map(t=>t.id===tid?{...t,tier:next}:t);
      return {...proj,actionItems:items};
    }));
  const completeTask = (tid,res)=>
    setProjects(p=>p.map(proj=>{
      if(proj.id!==activeProjectId) return proj;
      const items=proj.actionItems.map(t=>{
        if(t.id!==tid) return t;
        const up=[...t.updates,{type:'complete',author:'You',content:`Task ${res}`,date:new Date().toISOString().split('T')[0]}];
        return {...t,tier:'completed',updates:up};
      });
      return {...proj,actionItems:items};
    }));

  const renderTier = (label,tier)=>(
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
        <span className="font-bold text-lg">
          {label} ({totals[tier]})
        </span>
      </div>
      <div className="space-y-3">
        {(active?.actionItems.filter(i=>i.tier===tier)||[]).map(item=>(
          <ActionCard
            key={item.id}
            item={item}
            expanded={expandedId===item.id}
            onToggle={()=>setExpanded(expandedId===item.id?null:item.id)}
            onSubmit={submitUpdate}
            onTierChange={changeTier}
            onComplete={completeTask}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <div className="text-3xl font-bold">Project Tracker</div>
        <button
          className="px-3 py-1 border rounded"
          onClick={()=>setShowSettings(s=>!s)}
        >
          Settings
        </button>
      </div>

      {showSettings && (
        <div className="border p-4 rounded-lg bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <input
              className="border p-2"
              placeholder="New project name"
              value={newProjectName}
              onChange={e=>setNewProj(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded"
              onClick={addProject}
            >
              Add Project
            </button>
          </div>
          {projects.map(p=>(
            <div key={p.id} className="flex justify-between items-center">
              <span>{p.name}</span>
              <button
                className="px-2 py-1 border rounded"
                onClick={()=>deleteProject(p.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {!active ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map(p=>(
            <div
              key={p.id}
              className="cursor-pointer hover:bg-gray-50 rounded-lg border"
              onClick={()=>{setActive(p.id);setExpanded(null)}}
            >
              <div className="p-6">
                <div className="text-xl font-semibold text-blue-600">
                  {p.name}
                </div>
                <span className="text-sm">
                  Actions: {p.actionItems.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      ):(
        <div className="space-y-6">
          <button
            className="px-3 py-1 border rounded"
            onClick={()=>setActive(null)}
          >
            ← Back to all projects
          </button>
          <div>
            <div className="text-2xl font-bold mb-4">
              {active.name}
            </div>
            <button
              className="underline text-gray-700 mb-4"
              onClick={()=>setShowModal(true)}
            >
              + New Task
            </button>

            {showModal && (
              <div className="border rounded-lg p-4 bg-white shadow max-w-lg space-y-2">
                <input
                  className="border p-2 w-full"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={e=>setNewTask(prev=>({...prev,title:e.target.value}))}
                />
                <input
                  className="border p-2 w-full"
                  placeholder="Assigned to"
                  value={newTask.assignedTo}
                  onChange={e=>setNewTask(prev=>({...prev,assignedTo:e.target.value}))}
                />
                <div className="flex gap-3">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={addTask}
                  >
                    Add Task
                  </button>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={()=>setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {renderTier('Current','current')}
            {renderTier('Next Up','next')}
            {renderTier('Completed','completed')}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
