import { useState, useEffect, useCallback } from "react";

const USERNAME_STORAGE_KEY = "todoAppUserName";

export function useUserName() {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem(USERNAME_STORAGE_KEY);
    if (storedName) {
      setUserNameState(storedName);
    } else {
      setIsModalOpen(true); // Open modal if no name is stored
    }
  }, []);

  const setUserName = useCallback((name: string) => {
    if (name.trim()) {
      localStorage.setItem(USERNAME_STORAGE_KEY, name.trim());
      setUserNameState(name.trim());
      setIsModalOpen(false);
    } else {
      // Handle empty name submission if necessary, e.g. show an error
      // For now, we just don't set it or close the modal.
    }
  }, []);

  const clearUserName = useCallback(() => {
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    setUserNameState(null);
    setIsModalOpen(true); // Re-open modal if name is cleared
  }, []);

  return { userName, setUserName, clearUserName, isModalOpen, setIsModalOpen };
}
