import React, { useState } from "react";
import "../styles/RegisterPage.css";

function RegisterPage({ setIsAuthenticated, setCurrentPage, setToast }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Şifre kuralları kontrolü
  const validatePassword = (pw) => {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !email || !password || !password2) {
      setError("Tüm alanları doldurun.");
      return;
    }
    if (password !== password2) {
      setError("Şifreler aynı değil.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Şifre en az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter içermeli.");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
        setCurrentPage("home");
        if (setToast) {
          setToast({ type: "success", message: "Kaydınız başarıyla oluşturuldu!" });
        }
      } else {
        const data = await response.json();
        setError(data.error || "Kayıt başarısız. Email zaten kayıtlı olabilir.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
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
      <div className="register-glass">
        <h2>Kayıt Ol</h2>
        <form onSubmit={handleRegister} autoComplete="off">
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <input
            type="email"
            placeholder="Mail Adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Şifre Tekrar"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
          {error && <div className="register-error">{error}</div>}
          <button type="submit" className="register-btn">Kayıt Ol</button>
        </form>
        {success && (
          <div className="register-success">
            <span>✔</span>
            <div>
              Kayıt başarılı!<br />
              Ana sayfaya yönlendiriliyorsunuz...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;