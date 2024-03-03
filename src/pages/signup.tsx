import Head from "next/head";
import Header from "@/components/Header";
import { User } from "@/types/user";
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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className={styles.loginDiv}>
        <SignupForm handleSignup={handleSignup} />
      </div>
      <Background />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { user } = req.cookies;
  if (user) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }
  return await new Promise((resolve) => resolve({ props: {} }));
};
