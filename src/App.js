import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import OutlineInput from "./components/OutlineInput";
import PrimaryButton from "./components/PrimaryButton";
import TextButton from "./components/TextButton";
import ToDo from "./components/ToDo";

import "./App.css";

const STORAGE_KEY = "todo-list"; // 로컬스토리지 키
const THEME_KEY = "theme-mode"; // 테마 모드 저장 키

const App = () => {
  // 상태들 정의
  const [inputValue, setInputValue] = useState(""); // 입력 필드 값
  const [toDoList, setToDoList] = useState([]); // 할 일 목록
  const [editTargetId, setEditTargetId] = useState(null); // 편집 중인 할 일 ID
  const [editValue, setEditValue] = useState(""); // 편집 중인 값
  const [isDarkMode, setIsDarkMode] = useState(false); // 다크모드 상태
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  ); // 현재 시간

  // ⏰ 1초마다 현재 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 현재 시각 기준 시간대 가져오기
  const getCurrentHour = () => new Date().getHours();

  // 로컬스토리지에서 할 일 목록 & 테마 불러오기
  useEffect(() => {
    const storedList = localStorage.getItem(STORAGE_KEY);
    if (storedList) setToDoList(JSON.parse(storedList));

    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    } else {
      // 처음 진입 시 시간 기준 자동 설정
      const currentHour = getCurrentHour();
      setIsDarkMode(currentHour >= 18 || currentHour < 6);
    }
  }, []);

  // 할 일 목록 변경 시 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toDoList));
  }, [toDoList]);

  // 테마 변경 시 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // 입력값 변경 처리
  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  // 할 일 추가 함수
  const addToDo = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const currentTime = new Date().toLocaleTimeString();
    setToDoList((current) => [
      ...current,
      {
        id: uuidv4(),
        isComplete: false,
        value: trimmed,
        time: currentTime,
      },
    ]);
    setInputValue("");
  };

  // 완료 상태 토글
  const toggleComplete = (id) => {
    if (editTargetId) return;
    setToDoList((current) =>
      current.map((toDo) =>
        toDo.id === id ? { ...toDo, isComplete: !toDo.isComplete } : toDo
      )
    );
  };

  // 개별 삭제
  const deleteToDo = (id) => {
    if (editTargetId) return;
    setToDoList((current) => current.filter((toDo) => toDo.id !== id));
  };

  // 완료된 할 일 전체 삭제
  const removeAllCompletedToDo = () => {
    if (editTargetId) return;
    setToDoList((current) => current.filter((toDo) => !toDo.isComplete));
  };

  // 남은 할 일 계산
  const getUncompletedToDoList = () =>
    toDoList.filter((toDo) => !toDo.isComplete);

  // 편집 시작
  const startEdit = (id, value) => {
    setEditTargetId(id);
    setEditValue(value);
  };

  // 편집 중 값 변경
  const handleEditChange = (event) => {
    setEditValue(event.target.value);
  };

  // 편집 저장
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

  // 테마 토글
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

      {/* 입력창과 추가 버튼 */}
      <div className="app-form">
        <OutlineInput
          placeholder="무엇을 해야하나요?"
          value={inputValue}
          onChange={handleChange}
        />
        <PrimaryButton label="할 일 추가" onClick={addToDo} />
      </div>

      {/* 할 일 목록 표시 */}
      <div className="app-list">
        {toDoList.map((toDo) => (
          <ToDo
            key={toDo.id}
            isComplete={toDo.isComplete}
            value={toDo.value}
            time={toDo.time} // 추가된 시간
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

      {/* 푸터: 남은 할 일 + 완료 목록 삭제 */}
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
