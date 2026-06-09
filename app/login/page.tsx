"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // Simulação básica de redirecionamento baseada no e-mail
    if (email.includes("admin@")) {
      router.push("/admin");
    } else if (email.includes("gestor@")) {
      router.push("/manager");
    } else if (email.includes("personal@") || email.includes("trainer@")) {
      router.push("/trainer");
    } else {
      router.push("/student");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>GymTech</div>
        <h1 className={styles.title}>Acessar Sistema</h1>
        <p className={styles.subtitle}>Faça login com suas credenciais.</p>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Ex: admin@gymtech.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input type="password" id="password" placeholder="••••••••" required />
          </div>

          <button type="submit" className={styles.loginBtn}>Entrar</button>
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
