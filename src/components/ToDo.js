const ToDo = ({
  isComplete,
  value,
  time, // 시간 추가
  onClick,
  onDelete,
  onDoubleClick,
  isEditing,
  editValue,
  onEditChange,
  onEditSubmit,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onEditSubmit();
    }
  };

  return (
    <div className="to-do" data-is-complete={isComplete}>
      {isEditing ? (
        <input
          className="edit-input"
          value={editValue}
          onChange={onEditChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          style={{ display: "flex", alignItems: "center", flex: 1 }}
        >
          <div className="checkbox" />
          <p className="to-do-text">{value}</p>
        </div>
      )}
      {!isEditing && <button onClick={onDelete}>🗑️</button>}
      <p className="to-do-time">등록 시간: {time}</p> {/* 등록 시간 표시 */}
    </div>
  );
};

export default ToDo;
