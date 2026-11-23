# LLM ile çalışma rehberi (ekip için)

Yapay zekâ araçları (Claude, Copilot, ChatGPT vb.) işi hızlandırır, ama sorumluluk sende kalır. Kısa kurallar:

## Nasıl başlarsın?
1. **Editör içi araç** (Claude Code, Copilot, Cursor): Repoyu aç. Araç `AGENTS.md` dosyasını otomatik okur (Claude Code için `CLAUDE.md` onu içerir).
2. **Sohbet aracı** (ChatGPT, claude.ai): Sohbetin başına `AGENTS.md` içeriğini yapıştır, sonra görevini ve ilgili issue'nun metnini ekle.

## İyi bir istek şablonu
```
Bağlam: AGENTS.md (yukarıda). Rolüm: <DevOps | QA | Implementation | PO | SM | Architect>.
Görev: <issue numarası ve başlığı>; issue metni: <yapıştır>.
Girdi: <ilgili dosyalar, örn. api/openapi.yaml>.
Bitti sayılır: <issue'daki kriterler>.
Kısıtlar: kapsamı genişletme, sözleşmeyi değiştirme, gizli bilgi yazma.
Önce planı yaz, sonra uygula; belirsiz yer varsa soru sor.
```

## Rol bazlı örnek görevler
| Rol | İlk görev | LLM'e vereceğin girdiler |
|---|---|---|
| DevOps (Ahmet) | T-01 Docker Compose (api + db) | `AGENTS.md`, `backend/README.md`, `backend/requirements.txt`, `backend/.env.example` |
| QA (Nadir Efe) | T-04 test planı | `AGENTS.md`, `api/openapi.yaml`, US-01..US-09 kabul kriterleri, `backend/tests/` |
| Implementation (Faldozn) | T-03 şema, US-01..US-04 | `AGENTS.md`, `docs/architecture/` teknik belge (bölüm 4), `api/openapi.yaml` |
| PO (zsude) | US kriterlerini gözden geçirme | `AGENTS.md` bölüm 2 ve 3, ilgili issue'lar |
| SM (Nesibe) | T-06 sprint düzeni | `AGENTS.md`, `docs/process/Roller_ve_RACI_Matrisi.pdf` |

## Sorumluluk kuralları
- **Anlamadığın şeyi gönderme.** Üretilen kodu veya komutu önce oku, çalıştır, sonra PR aç. PR'da reviewer'ın göreceği şey senin sorumluluğundur.
- **Gizli bilgi yok:** şifre, token, anahtar, kişisel veri, özel linkler LLM'e yapıştırılmaz.
- **Uydurmaya dikkat:** LLM var olmayan bir kural veya komut söyleyebilir. Projeye özgü kural için kaynak `AGENTS.md`, `api/openapi.yaml` ve ADR'lerdir.
- **Sözleşme değişikliği LLM'den gelse bile** önce PR ile Architect ve PO'ya gider.
- Ders yönergesinde yapay zekâ kullanımıyla ilgili bir kural varsa ona uy; emin değilsen Scrum Master üzerinden hocaya sor.
