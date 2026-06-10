"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/login/page.module.css";
import { setupSuperAdmin } from "@/app/actions/auth";

export default function SetupSuperAdminPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    const res = await setupSuperAdmin(formData);

    if (res?.error) {
      setErrorMsg(res.error);
      setIsLoading(false);
      return;
    }

    if (res?.success) {
      alert("Conta do Super Admin criada com sucesso! Faça login para acessar.");
      router.push("/login");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>GymTech</div>
        <h1 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Configuração Inicial</h1>
        <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
          Crie a conta do Gestor Master (Super Admin) para poder cadastrar as academias.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && <div style={{ color: '#ef4444', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail do Master</label>
            <input name="email" type="email" id="email" placeholder="master@gymtech.com" required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha Master</label>
            <input name="password" type="password" id="password" placeholder="Mínimo 6 caracteres" required minLength={6} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirme a Senha</label>
            <input name="confirmPassword" type="password" id="confirmPassword" placeholder="Repita a senha" required minLength={6} />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Criar Super Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
