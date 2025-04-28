import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import OutlineInput from "./components/OutlineInput";
import PrimaryButton from "./components/PrimaryButton";
import TextButton from "./components/TextButton";
import ToDo from "./components/ToDo";

import "./App.css";

const STORAGE_KEY = "todo-list";
const THEME_KEY = "theme-mode"; // 추가

const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [toDoList, setToDoList] = useState([]);
  const [editTargetId, setEditTargetId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  ); // 현재 시간 상태

  // 현재 시간을 1초마다 업데이트하는 함수
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000); // 1초마다 시간 갱신

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 클리어
  }, []);

  const getCurrentHour = () => new Date().getHours();

  useEffect(() => {
    const storedList = localStorage.getItem(STORAGE_KEY);
    if (storedList) {
      setToDoList(JSON.parse(storedList));
    }

    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    } else {
      const currentHour = getCurrentHour();
      if (currentHour >= 18 || currentHour < 6) {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(false);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toDoList));
  }, [toDoList]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const addToDo = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const currentTime = new Date().toLocaleTimeString();
    setToDoList((current) => [
      ...current,
      { id: uuidv4(), isComplete: false, value: trimmed, time: currentTime },
    ]);
    setInputValue("");
  };

  const toggleComplete = (id) => {
    if (editTargetId) return;
    setToDoList((current) =>
      current.map((toDo) =>
        toDo.id === id ? { ...toDo, isComplete: !toDo.isComplete } : toDo
      )
    );
  };

  const deleteToDo = (id) => {
    if (editTargetId) return;
    setToDoList((current) => current.filter((toDo) => toDo.id !== id));
  };

  const removeAllCompletedToDo = () => {
    if (editTargetId) return;
    setToDoList((current) => current.filter((toDo) => !toDo.isComplete));
  };

  const getUncompletedToDoList = () =>
    toDoList.filter((toDo) => !toDo.isComplete);

  const startEdit = (id, value) => {
    setEditTargetId(id);
    setEditValue(value);
  };

  const handleEditChange = (event) => {
    setEditValue(event.target.value);
  };

  const saveEdit = (id) => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      alert("내용을 입력해주세요!");
      return;
    }
    setToDoList((current) =>
      current.map((toDo) =>
        toDo.id === id ? { ...toDo, value: trimmed } : toDo
      )
    );
    setEditTargetId(null);
    setEditValue("");
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`app ${isDarkMode ? "dark" : ""}`}>
      <h1 className="app-title">{isDarkMode ? "🌙" : "☀️"} 오늘 할 일</h1>
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? "☀️ 밝은 모드" : "🌙 다크 모드"}
      </button>

      {/* 현재 시간 표시 */}
      <div className="current-time">
        <p>현재 시간: {currentTime}</p>
      </div>

      <div className="app-form">
        <OutlineInput
          placeholder="무엇을 해야하나요?"
          value={inputValue}
          onChange={handleChange}
        />
        <PrimaryButton label="할 일 추가" onClick={addToDo} />
      </div>
      <div className="app-list">
        {toDoList.map((toDo) => (
          <ToDo
            key={toDo.id}
            isComplete={toDo.isComplete}
            value={toDo.value}
            time={toDo.time} // 시간 추가
            onClick={() => toggleComplete(toDo.id)}
            onDelete={() => deleteToDo(toDo.id)}
            onDoubleClick={() => startEdit(toDo.id, toDo.value)}
            isEditing={editTargetId === toDo.id}
            editValue={editValue}
            onEditChange={handleEditChange}
            onEditSubmit={() => saveEdit(toDo.id)}
          />
        ))}
      </div>
      <div className="app-footer">
        <p>
          남은 일: <strong>{getUncompletedToDoList().length}</strong>개
        </p>
        <TextButton label="완료 목록 삭제" onClick={removeAllCompletedToDo} />
      </div>
    </div>
  );
};

export default App;
