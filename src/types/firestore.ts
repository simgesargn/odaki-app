import { Timestamp } from "firebase/firestore";

/**
 * users/{userId}
 * - displayName: kullanıcının görüntü adı
 * - email: e-posta
 * - createdAt: doküman oluşturulma zamanı (Firestore Timestamp)
 * - premium: premium kullanıcı mı
 */
export type UserDoc = {
	displayName: string;
	email: string;
	createdAt: Timestamp;
	premium: boolean;
};

/**
 * focusSessions/{sessionId}
 * - userId: oturumu başlatan kullanıcı id'si
 * - minutes: hedeflenen dakika
 * - startedAt: başlangıç zamanı
 * - endedAt: bitiş zamanı (nullable)
 * - completed: oturum başarılı tamamlandı mı
 * - createdAt: doküman oluşturulma zamanı
 */
export type FocusSessionDoc = {
	userId: string;
	minutes: number;
	startedAt: Timestamp;
	endedAt?: Timestamp | null;
	completed: boolean;
	createdAt: Timestamp;
};

/**
 * allowedApps/{docId}
 * - userId: ilgili kullanıcı
 * - name: uygulama adı
 * - createdAt: doküman oluşturulma zamanı
 */
export type AllowedAppDoc = {
	userId: string;
	name: string;
	createdAt: Timestamp;
};

/**
 * blockedApps/{docId}
 * - userId: ilgili kullanıcı
 * - name: uygulama adı
 * - createdAt: doküman oluşturulma zamanı
 */
export type BlockedAppDoc = {
	userId: string;
	name: string;
	createdAt: Timestamp;
};
