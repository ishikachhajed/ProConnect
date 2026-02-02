import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import UserLayout from "@/layout/UserLayout";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  return (
    <UserLayout>
      <div className={`${styles.container} ${inter.className}`}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>A true social media platform, with stories no bufs !</p>

            <div
              onClick={() => router.push("/login")}
              className={styles.buttonJoin}
            >
              <p>Join Now</p>
            </div>
          </div>

          <div className={styles.mainContainer_right}>
            <Image
              src="/images/homemain_connection.jpg"
              alt="home"
              width={350}
              height={250}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
