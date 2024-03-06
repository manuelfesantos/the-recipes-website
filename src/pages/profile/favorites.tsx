import { GetServerSideProps } from "next";
import Header from "@/components/Header";
import Head from "next/head";
import { getCollection } from "@/utils/mongo-db/db-client";
import { ObjectId } from "mongodb";
import { isValidId, UserDTO } from "@/types/user";
import { buildUserDTOFromDocument } from "@/utils/transformer/document-to-dto";
import FavoriteMain from "@/components/FavoriteMain";
import Background from "@/components/Background";
import process from "process";
import { renewRecipeIfNeeded } from "@/utils/edamam-api/recipe-renewal";
import { deleteCookie } from "cookies-next";

export default function Favorites({ user }: { user: UserDTO }) {
  return (
    <>
      <Head>
        <title>{`${user.firstName}'s Favorite Recipes`}</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/ingredient-icon-6.jpg" />
      </Head>
      <Header />
      <FavoriteMain user={user} />
      <Background />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { user: userId } = req.cookies;
  if (!userId) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  const collection = await getCollection(
    String(process.env.USERS_COLLECTION_NAME),
  );

  try {
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      deleteCookie("user");
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    if (!isValidId(userId)) {
      res.setHeader("Set-Cookie", `user=deleted; Max-Age=0`);
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const userDTO = buildUserDTOFromDocument(user);

    const { recipes } = userDTO;

    if (recipes.length) {
      for (let i = 0; i < recipes.length; i++) {
        if (!recipes[i].uri) continue;
        const newRecipe = await renewRecipeIfNeeded(recipes[i]);
        if (newRecipe) {
          recipes[i] = newRecipe;
        }
      }
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            recipes: recipes,
          },
        },
      );
    }
    return {
      props: {
        user: userDTO,
      },
    };
  } catch (error) {
    console.log(error);
    deleteCookie("user");
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }
};
