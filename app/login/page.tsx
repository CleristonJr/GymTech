"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

import { loginUser } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await loginUser(formData);

    if (res?.error) {
      setErrorMsg(res.error);
      setIsLoading(false);
      return;
    }

    if (res?.success) {
      // Salva info básica no localStorage para uso do front-end
      localStorage.setItem("userId", res.userId as string);
      
      if (res.mustChangePassword) {
        router.push("/change-password");
        return;
      }

      switch (res.role) {
        case "SUPER_ADMIN":
          router.push("/admin");
          break;
        case "GYM_ADMIN":
          router.push("/manager");
          break;
        case "TRAINER":
          router.push("/trainer");
          break;
        default:
          router.push("/student");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>GymTech</div>
        <h1 className={styles.title}>Acessar Sistema</h1>
        <p className={styles.subtitle}>Faça login com suas credenciais.</p>

        <form className={styles.form} onSubmit={handleLogin}>
          {errorMsg && <div style={{ color: '#ef4444', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input 
              name="email"
              type="email" 
              id="email" 
              placeholder="Ex: admin@gymtech.com" 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input name="password" type="password" id="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            &larr; Voltar para a apresentação
          </Link>
        </div>
      </div>
    </div>
  );
}
