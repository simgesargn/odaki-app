import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: "#16a34a", // yeşil başlık
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
          Gizlilik Politikası
        </Text>
        <Text style={{ color: "#eaffef", marginTop: 4 }}>
          Son güncelleme: 24 Aralık 2024
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <Card icon="🛡️" title="Önemli Bilgilendirme">
          ODAKI, kişisel verilerin korunması konusunda hassasiyet gösterir. Bu
          uygulama bir eğitim projesidir ve gerçek kullanıcı verilerini toplamak
          için tasarlanmamıştır.
        </Card>

        <Card icon="🗄️" title="Toplanan Veriler">
          <Bullet>Hesap bilgileri (ad, e-posta, kullanıcı adı)</Bullet>
          <Bullet>Görev ve odak verileri</Bullet>
          <Bullet>Arkadaş listesi ve sosyal etkileşimler</Bullet>
          <Bullet>Kullanım istatistikleri</Bullet>
        </Card>

        <Card icon="🔒" title="Veri Güvenliği">
          <Bullet>Tüm veriler şifreli olarak saklanır</Bullet>
          <Bullet>Şifreler hash algoritması ile korunur</Bullet>
          <Bullet>SSL/TLS bağlantı güvenliği</Bullet>
          <Bullet>Düzenli güvenlik denetimleri</Bullet>
        </Card>

        <Card icon="👁️" title="Veri Kullanımı">
          <Bullet>Kullanıcı deneyimini iyileştirmek</Bullet>
          <Bullet>İstatistikler ve analizler oluşturmak</Bullet>
          <Bullet>Teknik destek sağlamak</Bullet>
        </Card>

        <Card icon="👤" title="Kullanıcı Hakları">
          <Bullet>Verilerinize erişim hakkı</Bullet>
          <Bullet>Verilerin düzeltilmesini isteme hakkı</Bullet>
          <Bullet>Verilerin silinmesini talep etme hakkı</Bullet>
          <Bullet>Hesabı devre dışı bırakma hakkı</Bullet>
        </Card>

        <Card icon="🚫" title="Üçüncü Taraf Paylaşımı">
          Verileriniz hiçbir şekilde üçüncü taraflarla paylaşılmaz, satılmaz
          veya kiralanmaz. Sadece yasal zorunluluklar dahilinde yetkili
          mercilerle paylaşılabilir.
        </Card>

        <View
          style={{
            marginTop: 14,
            borderRadius: 16,
            padding: 14,
            backgroundColor: "#111827", // koyu iletişim kartı
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
            İletişim
          </Text>
          <Text style={{ color: "#d1d5db", marginTop: 8 }}>
            Gizlilik ile ilgili sorularınız için:
          </Text>
          <Text style={{ color: "#e5e7eb", marginTop: 8 }}>
            ✉️ privacy@odaki.app
          </Text>
          <Text style={{ color: "#e5e7eb", marginTop: 6 }}>
            🌐 www.odaki.app/gizlilik
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 16,
        padding: 14,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#eef2f7",
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "800", marginBottom: 8 }}>
        {icon} {title}
      </Text>
      <View>{typeof children === "string" ? <Text>{children}</Text> : children}</View>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 6 }}>
      <Text style={{ marginRight: 8 }}>•</Text>
      <Text style={{ flex: 1, color: "#111827" }}>{children}</Text>
    </View>
  );
}