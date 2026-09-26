import { useState } from "react";
import { register, login } from "./api";

export default function Auth({ onLoggedIn }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const f = e.target;
    try {
      await register({
        tenant_name: f.tenant_name.value,
        email: f.email.value,
        password: f.password.value,
        confirm_password: f.confirm_password.value,
        mobile: f.mobile.value,
        gender: f.gender.value,
      });
      setMode("login");
    } catch (err) {
      setError(JSON.stringify(err.response?.data ?? err.message));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(e.target.email.value, e.target.password.value);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      onLoggedIn();
    } catch (err) {
      setError(JSON.stringify(err.response?.data ?? err.message));
    }
  };

  if (mode === "register") {
    return (
      <div>
        <h3>Register Tenant</h3>
        <form onSubmit={handleRegister}>
          <input
            name="tenant_name"
            placeholder="Organization / Tenant name"
            required
          />
          <br />
          <input name="email" type="email" placeholder="Email" required />
          <br />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <br />
          <input
            name="confirm_password"
            type="password"
            placeholder="Confirm password"
            required
          />
          <br />
          <input name="mobile" placeholder="Mobile number" required />
          <br />
          <select name="gender" required>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <br />
          <button type="submit">Register</button>
        </form>
        <button onClick={() => setMode("login")}>
          Already have an account? Login
        </button>
        {error && <pre style={{ color: "red" }}>{error}</pre>}
      </div>
    );
  }

  return (
    <div>
      <h3>Login</h3>
      <form onSubmit={handleLogin}>
        <input name="email" type="email" placeholder="Email" required />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
      <button onClick={() => setMode("register")}>New tenant? Register</button>
      {error && <pre style={{ color: "red" }}>{error}</pre>}
    </div>
  );
}
