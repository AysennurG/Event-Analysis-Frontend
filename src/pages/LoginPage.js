import React, { useState } from "react";
import "../styles/LoginPage.css";

function LoginPage({ setIsAuthenticated, setCurrentPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email ve şifre zorunlu.");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setIsAuthenticated(true);
        setCurrentPage("home");
      } else {
        setError(data.error || "Giriş başarısız.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:5000/auth/google/google";
  };

  const handleSignUp = () => {
    setCurrentPage("register");
  };

  return (
    <div className="register-bg">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
        src="/arkaplan.mp4"
      />
      <div className="register-glass login-glass-custom">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleLogin} autoComplete="off">
          <button
            className="register-btn google-btn"
            type="button"
            onClick={handleGoogleLogin}
          >
            <span className="google-icon" style={{ display: "flex", alignItems: "center", marginRight: 8 }}>
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                width={22}
                height={22}
                style={{ display: "block" }}
              />
            </span>
            Google ile Giriş Yap
          </button>
          <input
            type="email"
            placeholder="Mail Adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="register-error">{error}</div>}
          <button type="submit" className="register-btn white-btn">
            Giriş Yap
          </button>
        </form>
        <div className="sign-up-container">
          <p className="sign-up-text">Hesabın yok mu? Hemen kaydol.</p>
          <button className="sign-up-button" onClick={handleSignUp}>
            Kayıt Ol
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;