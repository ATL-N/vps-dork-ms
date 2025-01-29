// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import db from "../../../lib/db";
// import { handlers } from "../../../auth"; // Referring to the auth.ts we just created

// // /api/auth/[...nextauth]/route.js
// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Username or Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },

//       // Changed: Added the role and status properties to the returned user object
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Please enter a username/email and password");
//         }
//         try {
//           const isEmail = credentials.email.includes("@");
//           console.log("username/email2:", credentials.email, isEmail);

//           const query = isEmail
//             ? "SELECT * FROM users WHERE user_email = $1"
//             : "SELECT * FROM users WHERE user_name = $1";
//           const result = await db.query(query, [credentials.email]);
//           if (result.rows.length === 0) {
//             throw new Error("No user found with this username/email");
//           }
//           const user = result.rows[0];
//           console.log("user details:", user);
//           const isValid = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );
//           if (!isValid) {
//             throw new Error("Invalid password");
//           }
//           return {
//             id: user.user_id,
//             name: user.user_name,
//             email: user.user_email,
//             role: user.role, // Added the role property
//             status: user.status, // Added the status property
//           };
//         } catch (error) {
//           console.error("Authentication error:", error);
//           throw new Error(
//             error instanceof Error ? error.message : "Authentication failed"
//           );
//         }
//       },
//     }),
//   ],
//   session: {
//     secret: process.env.NEXTAUTH_SECRET, // Add this line here
//     // Changed: Increased the session duration to 1 hour
//     strategy: "jwt",
//     maxAge: 60 * 60 * 24, // 24 hours
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role; // Added the role property to the token
//         token.status = user.status; // Added the status property to the token
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.role = token.role; // Added the role property to the session user
//         session.user.status = token.status; // Added the status property to the session user
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/authentication/login", // Custom login page path (if you have one)
//   },
// });

// export { handler as GET, handler as POST };

// // export const { GET, POST } = handlers;




import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "../../../lib/db";
import { handlers } from "../../../auth";

const fetchUserRolesAndPermissions = async (userId) => {
  const roleQuery = `
    SELECT lower(r.role_name) AS role_name 
    FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.role_id 
    WHERE ur.user_id = $1
    ORDER BY r.role_name
  `;
  const roleResult = await db.query(roleQuery, [userId]);
  const roles = roleResult.rows.map((row) => row.role_name);

  const permissionQuery = `
    SELECT DISTINCT lower(p.permission_name) AS permission_name 
    FROM user_roles ur 
    JOIN role_permissions rp ON ur.role_id = rp.role_id 
    JOIN permissions p ON rp.permission_id = p.permission_id 
    WHERE ur.user_id = $1 
    ORDER BY permission_name;

  `;
  const permissionResult = await db.query(permissionQuery, [userId]);
  const permissions = permissionResult.rows.map((row) => row.permission_name);


  const semesterQuery = `
    SELECT 
      s.semester_id,
      s.semester_name,
      TO_CHAR(s.start_date, 'YYYY-MM-DD') as start_date,
      TO_CHAR(s.end_date, 'DD/MM/YYYY') AS end_date

    FROM 
      semesters s
    WHERE 
      s.status = 'active'

  `;

  const semesterResult = await db.query(semesterQuery);
  const activeSemester = semesterResult.rows[0]
 
  console.log('activeSemester.......2', activeSemester)

  return { roles, permissions, activeSemester };
};

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email?.trim() || !credentials?.password) {
          throw new Error("Please enter a username/email and password");
        }
        try {
          const isEmail = credentials.email.includes("@");
          const query = isEmail
            ? "SELECT * FROM users WHERE user_email = $1"
            : "SELECT * FROM users WHERE user_name = $1";
          const result = await db.query(query, [credentials.email]);
          if (result.rows.length === 0) {
            throw new Error("No user found with this username/email");
          }
          const user = result.rows[0];
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            throw new Error("Invalid password");
          }

          const { roles, permissions, activeSemester } =
            await fetchUserRolesAndPermissions(user.user_id);

          return {
            id: user.user_id,
            name: user.user_name,
            email: user.user_email,
            role: user.role,
            status: user.status,
            roles: roles,
            permissions: permissions,
            activeSemester: activeSemester,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Authentication failed"
          );
        }
      },
    }),
  ],
   session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60, // 1 hour - how frequently to refresh
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.roles = token.roles;
        session.user.permissions = token.permissions;
        session.user.activeSemester = token.activeSemester;
        // Add lastActivity timestamp
        session.lastActivity = Date.now();
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.roles = user.roles;
        token.permissions = user.permissions;
        token.activeSemester = user.activeSemester;
      }
      // Update the token's lastActivity
      token.lastActivity = Date.now();
      return token;
    },
  
  },
  pages: {
    signIn: "/authentication/login",
    // signOut: "/authentication/logout", // Set your custom sign out page
  },
});

export { handler as GET, handler as POST };