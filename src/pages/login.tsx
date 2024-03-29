import Head from "next/head";
import Header from "@/components/Header";
import { isValidId, UserCredentials } from "@/types/user";
import { GetServerSideProps } from "next";
import styles from "@/styles/Login.module.css";
import LoginForm from "@/components/LoginForm";
import Background from "@/components/Background";
import { getCollection } from "@/utils/mongo-db/db-client";
import process from "process";
import { ObjectId } from "mongodb";

export default function Login() {
  const handleLogin = async (
    credentials: UserCredentials,
  ): Promise<Response> => {
    const headers = new Headers();
    headers.append("action", "login");
    return await fetch(`/api/users`, {
      body: JSON.stringify(credentials),
      headers: headers,
      method: "POST",
    });
  };

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ingredient-icon-6.jpg" />
      </Head>
      <Header />
      <div className={styles.loginDiv}>
        <LoginForm handleLogin={handleLogin} />
      </div>
      <Background />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  resolvedUrl,
}) => {
  console.log("Request status code:", req.statusCode);
  console.log("Request Headers: ", req.headers);
  console.log("Resolved URL: ", resolvedUrl);
  const { user: userId } = req.cookies;
  if (!userId) {
    console.log("No user cookie on login");
    return await new Promise((resolve) => resolve({ props: {} }));
  }
  console.log("User Cookie: ", userId);
  if (!isValidId(userId)) {
    console.log("Invalid user cookie on login page");

    res.setHeader("Set-Cookie", `user=deleted; Max-Age=0`);
    return {
      props: {},
    };
  }

  const collection = await getCollection(
    String(process.env.USERS_COLLECTION_NAME),
  );
  const user = await collection.findOne({ _id: new ObjectId(userId) });

  if (user) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }

  res.setHeader("Set-Cookie", `user=deleted; Max-Age=0`);
  return {
    props: {},
  };
};
