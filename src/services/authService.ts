import { auth } from "../firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, sendPasswordResetEmail, UserCredential } from "firebase/auth";

export async function signUp(email: string, password: string): Promise<{ ok: true; user: UserCredential } | { ok: false; error: string }> {
	try {
		const cred = await createUserWithEmailAndPassword(auth, email, password);
		return { ok: true, user: cred };
	} catch (err: any) {
		return { ok: false, error: err?.message ?? "Kayıt sırasında hata oluştu" };
	}
}

export async function signIn(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
	try {
		await signInWithEmailAndPassword(auth, email, password);
		return { ok: true };
	} catch (err: any) {
		return { ok: false, error: err?.message ?? "Giriş başarısız" };
	}
}

export async function signOutUser(): Promise<{ ok: true } | { ok: false; error: string }> {
	try {
		await fbSignOut(auth);
		return { ok: true };
	} catch (err: any) {
		return { ok: false, error: err?.message ?? "Çıkış yapılamadı" };
	}
}

export async function resetPassword(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
	try {
		await sendPasswordResetEmail(auth, email);
		return { ok: true };
	} catch (err: any) {
		return { ok: false, error: err?.message ?? "Şifre sıfırlama başarısız" };
	}
}
