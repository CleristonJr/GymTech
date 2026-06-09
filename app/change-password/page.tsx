"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import styles from "@/app/login/page.module.css";
import { changeInitialPassword } from "@/app/actions/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      router.push("/login");
    } else {
      setUserId(id);
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    setErrorMsg("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    const res = await changeInitialPassword(userId, newPassword);

    if (res?.error) {
      setErrorMsg(res.error);
      setIsLoading(false);
      return;
    }

    if (res?.success) {
      alert("Senha alterada com sucesso! Bem-vindo(a) ao seu painel.");
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

  if (!userId) return null; // loading state

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>GymTech</div>
        <h1 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bem-vindo(a) Gestor(a)!</h1>
        <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
          Para garantir a segurança da sua academia, você precisa criar a sua senha definitiva antes de prosseguir.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMsg && <div style={{ color: '#ef4444', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>{errorMsg}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">Nova Senha Forte</label>
            <input name="newPassword" type="password" id="newPassword" placeholder="No mínimo 6 caracteres" required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirme a Nova Senha</label>
            <input name="confirmPassword" type="password" id="confirmPassword" placeholder="Repita a senha" required />
          </div>

          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Senha e Acessar"}
          </button>
        </form>
      </div>
    </div>
  );
}
