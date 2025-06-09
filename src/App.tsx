import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";

interface User {
  id: string;
  name: string;
  email: string;
}

interface NewUser {
  name: string;
  email: string;
}

const API_URL = "https://68466fef7dbda7ee7aaf060c.mockapi.io/user";

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await axios.get(API_URL);
  return data;
};

const addUser = async (newUser: NewUser): Promise<User> => {
  const { data } = await axios.post(API_URL, newUser);
  return data;
};

const updateUser = async ({
  id,
  ...user
}: { id: string } & NewUser): Promise<User> => {
  const { data } = await axios.put(`${API_URL}/${id}`, user);
  return data;
};

const deleteUser = async (id: string): Promise<string> => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
};

function App() {
  const queryClient = useQueryClient();
  const [newUser, setNewUser] = useState<NewUser>({ name: "", email: "" });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const addMutation = useMutation<User, Error, NewUser>({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setErrorMessage(null);
      Swal.fire({
        title: "Muvaffaqiyat!",
        text: "Foydalanuvchi muvaffaqiyatli qo‘shildi",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      setErrorMessage(`Qo‘shishda xato: ${error.message}`);
    },
  });

  const updateMutation = useMutation<User, Error, { id: string } & NewUser>({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      setErrorMessage(null);
      Swal.fire({
        title: "Muvaffaqiyat!",
        text: "Foydalanuvchi muvaffaqiyatli yangilandi",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      setErrorMessage(`Yangilashda xato: ${error.message}`);
    },
  });

  const deleteMutation = useMutation<string, Error, string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setErrorMessage(null);
      setDeletingId(null);
      Swal.fire({
        title: "Muvaffaqiyat!",
        text: "Foydalanuvchi muvaffaqiyatli o‘chirildi",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (error) => {
      setErrorMessage(`O‘chirishda xato: ${error.message}`);
      setDeletingId(null);
    },
  });

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, ...newUser });
    } else {
      addMutation.mutate(newUser);
    }
    setNewUser({ name: "", email: "" });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNewUser({ name: user.name, email: user.email });
    setErrorMessage(null);
  };

  const handleClearForm = () => {
    setNewUser({ name: "", email: "" });
    setEditingUser(null);
    setErrorMessage(null);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "O‘chirishni tasdiqlang",
      text: "Haqiqatan ham ushbu foydalanuvchini o‘chirmoqchimisiz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ha, o‘chirish",
      cancelButtonText: "Bekor qilish",
    }).then((result) => {
      if (result.isConfirmed) {
        setDeletingId(id);
        deleteMutation.mutate(id);
      }
    });
  };

  if (isLoading)
    return (
      <div className="text-center mt-8">
        <svg
          className="animate-spin h-8 w-8 mx-auto text-blue-500"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <p>Yuklanmoqda...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-8 text-red-500 p-4 bg-red-100 rounded">
        Xatolik: {error.message}
      </div>
    );

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4 sm:text-3xl">
        {editingUser ? "Foydalanuvchini tahrirlash" : "Foydalanuvchi qo‘shish"}
      </h1>

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleAddOrUpdate} className="mb-8 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Ism
          </label>
          <input
            id="name"
            type="text"
            placeholder="Ism kiriting"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="mt-1 border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email kiriting"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="mt-1 border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={addMutation.isPending || updateMutation.isPending}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 flex-1"
          >
            {addMutation.isPending || updateMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Yuklanmoqda...
              </span>
            ) : editingUser ? (
              "Yangilash"
            ) : (
              "Qo‘shish"
            )}
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 flex-1"
          >
            Tozalash
          </button>
        </div>
      </form>

      <h2 className="text-xl font-semibold mb-4 sm:text-2xl">
        Foydalanuvchilar ro‘yxati
      </h2>
      <ul className="space-y-4">
        {users?.map((user) => (
          <li
            key={user.id}
            className="border p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="flex space-x-2 w PIECE OF ARTIFACT w-full sm:w-auto">
              <button
                onClick={() => handleEdit(user)}
                className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 flex-1 sm:flex-none"
              >
                Tahrirlash
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                disabled={deletingId === user.id}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:bg-red-300 flex-1 sm:flex-none"
              >
                {deletingId === user.id ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    O‘chirilmoqda...
                  </span>
                ) : (
                  "O‘chirish"
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
