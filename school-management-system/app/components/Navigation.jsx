// components/Navigation.js
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";


const Navigation = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/authentication/login");
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/authentication/login");
  };

  return (
    <header>
      {/* <nav>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav> */}
    </header>
  );
};

export default Navigation;
