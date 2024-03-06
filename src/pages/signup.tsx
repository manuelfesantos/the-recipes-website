import Head from "next/head";
import Header from "@/components/Header";
import { isValidId, User } from "@/types/user";
import { GetServerSideProps } from "next";
import styles from "@/styles/Login.module.css";
import SignupForm from "@/components/SignupForm";
import Background from "@/components/Background";

export default function Signup() {
  const handleSignup = async (user: User) => {
    const headers = new Headers();
    headers.append("action", "signup");
    return await fetch("/api/users", {
      body: JSON.stringify(user),
      headers: headers,
      method: "POST",
    });
  };

  return (
    <>
      <Head>
        <title>Profile Page</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ingredient-icon-6.jpg" />
      </Head>
      <Header />
      <div className={styles.loginDiv}>
        <SignupForm handleSignup={handleSignup} />
      </div>
      <Background />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { user: userId } = req.cookies;
  if (!userId) {
    return await new Promise((resolve) => resolve({ props: {} }));
  }
  if (!isValidId(userId)) {
    res.setHeader("Set-Cookie", `user=deleted; Max-Age=0`);
    return {
      props: {},
    };
  }
  return {
    redirect: {
      destination: "/profile",
      permanent: false,
    },
  };
};
