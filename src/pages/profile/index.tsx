import Head from "next/head";
import Header from "@/components/Header";
import { User, UserList } from "@/types/user";
import { useEffect, useRef, useState } from "react";
import { GetServerSideProps } from "next";

export default function ProfilePage() {
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<string>("");

  const getUsers = async () => {
    const res = await fetch("http://localhost:3000/api/users", {
      method: "GET",
    });

    const serverUsers: UserList = (await res.json()).users;
    setUsers(
      Object.keys(serverUsers).map((index) => serverUsers[Number(index)]),
    );
  };

  useEffect(() => {
    getUsers();
  }, [users]);
  const handleSaveUser = async () => {
    if (username.current && password.current) {
      const saveUsername = username.current.value;
      const savePassword = password.current.value;
      if (saveUsername && savePassword) {
        const res = await fetch("http://localhost:3000/api/users", {
          method: "POST",
          body: JSON.stringify({
            username: saveUsername,
            password: savePassword,
          }),
        });
      }
    }
    await getUsers();
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: "DELETE",
    });
    setUsers((prevState) => prevState.filter((user) => user._id !== id));
  };

  const updatingUsernameRef = useRef<HTMLInputElement>(null);
  const updatingPasswordRef = useRef<HTMLInputElement>(null);
  const [updatingUsername, setUpdatingUsername] = useState<string>("");
  const [updatingPassword, setUpdatingPassword] = useState<string>("");

  const toggleUpdatingUser = (user: User) => {
    if (isUpdatingUser(user._id)) {
      setUpdatingUserId("");
      setUpdatingUsername("");
      setUpdatingPassword("");
    } else {
      setUpdatingUserId(user._id);
      setUpdatingUsername(user.username);
      setUpdatingPassword(user.password);
    }
  };

  const isUpdatingUser = (id: string) => {
    return updatingUserId === id;
  };

  const updateUser = async (id: string) => {
    const user: User = {
      _id: id,
      username: updatingUsername,
      password: updatingPassword,
    };
    const res = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
    toggleUpdatingUser(user);
    await getUsers();
  };

  return (
    <>
      <Head>
        <title>Profile Page</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <form onSubmit={handleSaveUser}>
        <label htmlFor={"username"}>Username: </label>
        <input type={"text"} id={"username"} ref={username} />
        <label htmlFor={"password"}>Password: </label>
        <input type={"text"} id={"password"} ref={password} />
        <button type={"submit"}>Sign Up</button>
      </form>
      {users.map((user) => (
        <div key={user._id}>
          {isUpdatingUser(user._id) ? (
            <>
              <label htmlFor={"update-username"}>Username: </label>
              <input
                id={"update-username"}
                type={"text"}
                value={updatingUsername}
                ref={updatingUsernameRef}
                onChange={(event) => setUpdatingUsername(event.target.value)}
              />
              <label htmlFor={"update-password"}>Password: </label>
              <input
                id={"update-password"}
                type={"text"}
                value={updatingPassword}
                ref={updatingPasswordRef}
                onChange={(event) => setUpdatingPassword(event.target.value)}
              />
              <button type={"button"} onClick={() => updateUser(user._id)}>
                Update User
              </button>
            </>
          ) : (
            <>
              <h4>username: {user.username}</h4>
              <h5>password: {user.password}</h5>
            </>
          )}

          <button onClick={() => handleDeleteUser(user._id)}>
            Delete User
          </button>

          {!isUpdatingUser(user._id) && (
            <button onClick={() => toggleUpdatingUser(user)}>
              Update User
            </button>
          )}
        </div>
      ))}
    </>
  );
}