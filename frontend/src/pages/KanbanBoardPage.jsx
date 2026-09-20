import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchBoards, addCardToList, optimisticMoveCard, moveCardOptimistic, createBoard } from '../store/slices/boardSlice';
import { Plus, Tag, Clock, Layers } from 'lucide-react';

const KanbanBoardPage = () => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { currentBoard, loading } = useSelector((state) => state.board);

  const [newCardTitle, setNewCardTitle] = useState('');
  const [activeListId, setActiveListId] = useState(null);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showBoardModal, setShowBoardModal] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      dispatch(fetchBoards(currentWorkspace._id));
    }
  }, [currentWorkspace, dispatch]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // 1. Dispatch Immediate Optimistic State Mutation in Redux Store
    dispatch(
      optimisticMoveCard({
        sourceListId: source.droppableId,
        targetListId: destination.droppableId,
        cardId: draggableId,
        newPosition: destination.index
      })
    );

    // 2. Dispatch Async Persistence to Backend MongoDB API
    dispatch(
      moveCardOptimistic({
        boardId: currentBoard._id,
        sourceListId: source.droppableId,
        targetListId: destination.droppableId,
        cardId: draggableId,
        newPosition: destination.index
      })
    );
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !activeListId) return;

    dispatch(
      addCardToList({
        boardId: currentBoard._id,
        listId: activeListId,
        cardData: { title: newCardTitle, priority: 'HIGH', storyPoints: 2 }
      })
    ).then(() => {
      setNewCardTitle('');
      setActiveListId(null);
    });
  };

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !currentWorkspace) return;
    dispatch(createBoard({ workspaceId: currentWorkspace._id, title: newBoardTitle })).then(() => {
      setNewBoardTitle('');
      setShowBoardModal(false);
    });
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Board Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentBoard?.title || 'Kanban Board'}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20">
            Optimistic UI
          </span>
        </div>

        <button
          onClick={() => setShowBoardModal(true)}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow"
        >
          <Plus className="w-4 h-4" /> New Board
        </button>
      </div>

      {/* Drag and Drop Kanban Board */}
      {currentBoard ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
            {currentBoard.lists?.map((list) => (
              <div
                key={list._id}
                className="w-72 shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col max-h-full"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {list.title} <span className="text-slate-400 text-xs">({list.cards?.length || 0})</span>
                  </h3>
                  <button
                    onClick={() => setActiveListId(list._id)}
                    className="p-1 text-slate-400 hover:text-brand-500 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Creation Input */}
                {activeListId === list._id && (
                  <form onSubmit={handleAddCard} className="mb-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Card title..."
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-brand-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveListId(null)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-[11px] font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}

                {/* Droppable Container */}
                <Droppable droppableId={list._id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[100px] rounded-xl transition ${
                        snapshot.isDraggingOver ? 'bg-brand-500/5' : ''
                      }`}
                    >
                      {list.cards?.map((card, index) => (
                        <Draggable key={card._id} draggableId={card._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm transition hover:border-brand-500/50 ${
                                snapshot.isDragging ? 'shadow-2xl rotate-1 scale-105 border-brand-500' : ''
                              }`}
                            >
                              <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">{card.title}</p>
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                                <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                  {card.priority || 'MEDIUM'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-indigo-400" /> {card.storyPoints || 1} pts
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
          No active Kanban board found. Click "New Board" to initialize a workflow pipeline.
        </div>
      )}

      {/* Create Board Modal */}
      {showBoardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Workflow Board</h3>
            <input
              type="text"
              placeholder="e.g. Q4 Sprint Execution"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowBoardModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">
                Cancel
              </button>
              <button onClick={handleCreateBoard} className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow">
                Create Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoardPage;
