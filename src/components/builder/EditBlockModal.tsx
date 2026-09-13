'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MicrositeBlock } from '@/types';
import {
  Link2,
  Heading,
  MessageCircle,
  Clock,
  FileText,
  Share2,
  Image as ImageIcon,
  HelpCircle,
  Plus,
  Trash2,
  Save,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface EditBlockModalProps {
  isOpen: boolean;
  block: MicrositeBlock | null;
  onClose: () => void;
  onSave: (updatedBlock: MicrositeBlock) => void;
}

export const EditBlockModal: React.FC<EditBlockModalProps> = ({
  isOpen,
  block,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<MicrositeBlock['content']>({});

  useEffect(() => {
    if (block) {
      // Deep clone content to allow isolated edits
      setFormData(JSON.parse(JSON.stringify(block.content || {})));
    }
  }, [block]);

  if (!block) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...block,
      content: formData,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  // Helper for Social Media array manipulation
  const socials = formData.socials || [];

  const handleAddSocial = () => {
    const newSocials = [...socials, { platform: 'instagram' as const, url: 'https://instagram.com/' }];
    setFormData({ ...formData, socials: newSocials });
  };

  const handleUpdateSocial = (index: number, key: 'platform' | 'url', value: string) => {
    const newSocials = [...socials];
    newSocials[index] = { ...newSocials[index], [key]: value };
    setFormData({ ...formData, socials: newSocials });
  };

  const handleRemoveSocial = (index: number) => {
    const newSocials = socials.filter((_, i) => i !== index);
    setFormData({ ...formData, socials: newSocials });
  };

  // Helper for FAQs array manipulation
  const faqs = formData.faqs || [];

  const handleAddFaq = () => {
    const newFaqs = [
      ...faqs,
      { question: 'Pertanyaan umum baru?', answer: 'Jawaban penjelasan untuk pertanyaan ini.' },
    ];
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleUpdateFaq = (index: number, key: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [key]: value };
    setFormData({ ...formData, faqs: newFaqs });
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFormData({ ...formData, faqs: newFaqs });
  };

  // Format ISO to datetime-local string (YYYY-MM-DDTHH:mm)
  const formatForDateTimeInput = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Block: ${block.type}`}
      description="Ubah konten, teks, link, dan konfigurasi block ini"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* ================= LINK BLOCK ================= */}
        {block.type === 'LINK' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Tombol Tautan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: 📚 Modul Pelatihan KKG 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Tujuan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://drive.google.com/... atau https://event.mfytech.my.id/slug"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi / Keterangan Singkat (Opsional)
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Contoh: Unduh slide presentasi dan materi kurikulum"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* ================= HEADING BLOCK ================= */}
        {block.type === 'HEADING' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teks Judul / Heading <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Materi & Sumber Belajar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subtitle / Catatan Kategori (Opsional)
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Contoh: Kumpulan modul resmi tahun ajaran 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ukuran Heading
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'H1 (Besar)', value: 'h1' },
                  { label: 'H2 (Sedang)', value: 'h2' },
                  { label: 'H3 (Kecil)', value: 'h3' },
                ].map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, level: lvl.value as any })}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      (formData.level || 'h2') === lvl.value
                        ? 'border-[#5B5BF7] bg-indigo-50 text-[#5B5BF7]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEXT BLOCK ================= */}
        {block.type === 'TEXT' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Isi Paragraf / Informasi Teks <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tuliskan pengumuman, panduan, atau informasi penting yang ingin disampaikan kepada pengunjung..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ================= WHATSAPP BLOCK ================= */}
        {block.type === 'WHATSAPP' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Label Tombol WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Konsultasi & Tanya Jawab"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#25D366] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon WhatsApp (Format Internasional) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="6281234567890 (Gunakan kode negara tanpa tanda +)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#25D366] focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Format: 628xxxxxxxxxx (Jangan gunakan 08xx atau simbol + di depan).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pesan Pembuka Otomatis (Prefilled Message)
              </label>
              <textarea
                rows={2}
                value={formData.prefilledText || ''}
                onChange={(e) => setFormData({ ...formData, prefilledText: e.target.value })}
                placeholder="Contoh: Halo Mas Alfy, saya ingin bertanya seputar materi pelatihan..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#25D366] focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* ================= COUNTDOWN BLOCK ================= */}
        {block.type === 'COUNTDOWN' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Acara / Keterangan Countdown <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Batas Pengumpulan Tugas Akhir Portofolio"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal & Waktu Target Berakhir <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formatForDateTimeInput(formData.targetDate)}
                onChange={(e) => setFormData({ ...formData, targetDate: new Date(e.target.value).toISOString() })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Timer di microsite akan otomatis menghitung mundur hari, jam, menit, dan detik.
              </p>
            </div>
          </div>
        )}

        {/* ================= SOCIAL MEDIA BLOCK ================= */}
        {block.type === 'SOCIAL' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Kanal Media Sosial ({socials.length})
              </label>
              <button
                type="button"
                onClick={handleAddSocial}
                className="flex items-center gap-1 text-xs font-bold text-[#5B5BF7] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Platform</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {socials.map((soc, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5"
                >
                  <select
                    value={soc.platform}
                    onChange={(e) => handleUpdateSocial(idx, 'platform', e.target.value)}
                    className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden shrink-0 capitalize"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="github">GitHub</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={soc.url}
                    onChange={(e) => handleUpdateSocial(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#5B5BF7]"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Hapus kanal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {socials.length === 0 && (
                <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  Belum ada akun media sosial. Klik &quot;Tambah Platform&quot; di atas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= IMAGE BLOCK ================= */}
        {block.type === 'IMAGE' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Gambar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... atau URL gambar langsung"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul / Keterangan Gambar (Opsional)
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Dokumentasi Workshop Guru Penggerak"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tautan Klik Gambar (Opsional)
              </label>
              <input
                type="text"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://... (jika pengunjung mengklik gambar ini)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* ================= FAQ ACCORDION BLOCK ================= */}
        {block.type === 'FAQ' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Seksi FAQ (Opsional)
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Tanya Jawab Seputar Acara"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#5B5BF7] focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Daftar Pertanyaan & Jawaban ({faqs.length})
              </label>
              <button
                type="button"
                onClick={handleAddFaq}
                className="flex items-center gap-1 text-xs font-bold text-[#5B5BF7] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      Q{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Hapus FAQ ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                    placeholder="Tuliskan pertanyaan..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#5B5BF7]"
                  />

                  <textarea
                    rows={2}
                    required
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                    placeholder="Tuliskan jawaban penjelasan..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-[#5B5BF7]"
                  />
                </div>
              ))}

              {faqs.length === 0 && (
                <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  Belum ada pertanyaan FAQ. Klik &quot;Tambah FAQ&quot; di atas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= DIVIDER BLOCK ================= */}
        {block.type === 'DIVIDER' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
            Block ini berfungsi sebagai garis pembatas visual antar konten pada halaman microsite Anda.
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5BF7] to-[#06B6D4] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
