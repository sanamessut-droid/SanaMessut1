import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import Modal from '@/components/Modal';
import { useLibrary } from '@/contexts/LibraryContext';
import { describeError } from '@/lib/errors';
import { IMPORT_TARGETS, countByStatus, type ColumnMapping, type ImportDefaults, type ImportPreviewRow, type ImportTarget, type ParsedTable } from '@/lib/wordImport';
import { type Category } from '@/lib/vocabulary';

interface ImportReviewPanelProps {
  table: ParsedTable;
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  defaults: ImportDefaults;
  onDefaultsChange: (defaults: ImportDefaults) => void;
  categories: Category[];
  rows: ImportPreviewRow[];
  onStart: (rows: ImportPreviewRow[]) => void;
  onBack: () => void;
}

const STATUS_STYLES = {
  ready: 'bg-emerald-50 text-emerald-700',
  duplicate: 'bg-amber-50 text-amber-800',
  invalid: 'bg-rose-50 text-rose-700',
} as const;

const STATUS_LABELS = {
  ready: 'Eklenecek',
  duplicate: 'Zaten var',
  invalid: 'Hatalı',
} as const;

const selectClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export default function ImportReviewPanel({
  table,
  mapping,
  onMappingChange,
  defaults,
  onDefaultsChange,
  categories,
  rows,
  onStart,
  onBack,
}: ImportReviewPanelProps) {
  const { addCategory } = useLibrary();
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState(false);
  const [excludedRecordNumbers, setExcludedRecordNumbers] = useState<Set<number>>(new Set());
  const visibleRows = rows.filter((row) => !excludedRecordNumbers.has(row.recordNumber));
  const counts = countByStatus(visibleRows);
  const requiredMapped = mapping.finnish !== undefined && mapping.turkish !== undefined;
  const hasMissingList = visibleRows.some((row) => row.issues.includes('Liste seçilmedi'));
  const hasOtherListDuplicates = visibleRows.some((row) => row.duplicateKind === 'otherList');
  const canStart = requiredMapped && counts.ready > 0;

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = categoryName.trim();
    if (!trimmed) {
      setCategoryError('Lütfen bir kelime listesi adı girin.');
      return;
    }
    if (categories.some((category) => category.name.toLocaleLowerCase('tr-TR') === trimmed.toLocaleLowerCase('tr-TR'))) {
      setCategoryError('Bu isimde bir kelime listesi zaten var.');
      return;
    }
    setIsSavingCategory(true);
    setCategoryError(null);
    try {
      const created = await addCategory(trimmed);
      if (created) {
        onDefaultsChange({ ...defaults, categoryId: created.id });
        setCategoryName('');
        setIsCreatingCategory(false);
      }
    } catch (error) {
      setCategoryError(describeError(error));
    } finally {
      setIsSavingCategory(false);
    }
  };

  const setColumn = (target: ImportTarget, value: string) => {
    const next = { ...mapping };
    if (value === '') delete next[target];
    else next[target] = Number(value);
    onMappingChange(next);
  };

  const handleStartClick = () => {
    if (hasOtherListDuplicates) {
      setIsDuplicateConfirmOpen(true);
      return;
    }
    onStart(visibleRows);
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">1. Sütunları eşleştirin</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {IMPORT_TARGETS.map((target) => (
            <label key={target.key} className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">
                {target.label}
                {target.required && <span className="text-rose-600"> *</span>}
              </span>
              <select
                className={selectClass}
                value={mapping[target.key] === undefined ? '' : String(mapping[target.key])}
                onChange={(event) => setColumn(target.key, event.target.value)}
              >
                <option value="">Bu bilgi yok</option>
                {table.headers.map((header, index) => (
                  <option key={index} value={index}>
                    {header.trim() || `Sütun ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Kelime listeleri <span className="text-rose-600">*</span></span>
              <select
                className={`${selectClass} ${hasMissingList ? 'border-rose-500 ring-2 ring-rose-100 focus:border-rose-500 focus:ring-rose-100' : ''}`}
                value={defaults.categoryId ?? ''}
                onChange={(event) => onDefaultsChange({ ...defaults, categoryId: event.target.value || null })}
              >
                <option value="">Kelime listesi seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {hasMissingList && <span className="block text-xs font-semibold text-rose-700">Liste seçilmedi. Lütfen bir kelime listesi seçin.</span>}
              <button
                type="button"
                onClick={() => { setCategoryError(null); setIsCreatingCategory(true); }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 transition hover:text-blue-900"
              >
                <Plus className="h-4 w-4" /> Yeni Liste Ekle
              </button>
            </label>
        </div>
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">2. Önizleme</h3>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{counts.ready} eklenecek</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">{counts.duplicate} zaten kayıtlı</span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">{counts.invalid} hatalı</span>
        </div>
        {counts.duplicate > 0 && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            {counts.duplicate} adet kelime bu listede zaten kayıtlı. Listeye {counts.ready} yeni kelime eklenecek.
          </p>
        )}
        <p className="text-xs text-slate-500">
          Aynı listede daha önce kayıtlı olan kelimeler eklenmez. Farklı listelerde kayıtlı kelimeler bu listeye eklenebilir. İstemediğiniz satırları çarpı düğmesiyle çıkarabilirsiniz.
        </p>
        <div className="max-h-[32rem] overflow-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-center">Çıkar</th>
                <th className="px-3 py-2">Kayıt</th>
                <th className="px-3 py-2">Fince</th>
                <th className="px-3 py-2">Türkçe</th>
                <th className="px-3 py-2">Durum</th>
                <th className="px-3 py-2">Not</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((row) => (
                <tr key={row.recordNumber}>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => setExcludedRecordNumbers((previous) => new Set(previous).add(row.recordNumber))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                      aria-label={`${row.recordNumber}. kaydı çıkar`}
                      title="Bu kaydı ekleme"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{row.recordNumber}</td>
                  <td className={`px-3 py-2 font-semibold ${row.duplicateKind ? 'text-rose-700' : 'text-slate-900'}`}>{row.values?.finnish ?? '-'}</td>
                  <td className={`px-3 py-2 ${row.duplicateKind ? 'text-rose-700' : 'text-slate-700'}`}>{row.values?.turkish ?? '-'}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[row.status]}`}>
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.issues.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          {visibleRows.length} kayıt gösteriliyor. Toplam {rows.length} kayıttan {rows.length - visibleRows.length} kayıt çıkarıldı.
        </p>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Geri dön
        </button>
        <button
          type="button"
          onClick={handleStartClick}
          disabled={!canStart}
          className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
        >
          {counts.ready} kelimeyi ekle
        </button>
      </div>
      {isDuplicateConfirmOpen && (
        <Modal title="Zaten kayıtlı kelimeler" onClose={() => setIsDuplicateConfirmOpen(false)}>
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-slate-700">
              Bu kelimelerin bazıları başka listelerde zaten kayıtlı. Yine de seçtiğiniz listeye eklemek istiyor musunuz? Aynı listede daha önce bulunan kelimeler tekrar eklenmez.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsDuplicateConfirmOpen(false)}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hayır, istemiyorum — önizleme sayfasına dön
              </button>
              <button
                type="button"
                onClick={() => { setIsDuplicateConfirmOpen(false); onStart(visibleRows); }}
                className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                Evet, istiyorum
              </button>
            </div>
          </div>
        </Modal>
      )}
      {isCreatingCategory && (
        <Modal title="Yeni Liste Ekle" onClose={() => setIsCreatingCategory(false)}>
          <form onSubmit={handleCreateCategory} className="space-y-5">
            <div>
              <label htmlFor="import-new-category" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Kelime listesi adı *
              </label>
              <input
                id="import-new-category"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                maxLength={60}
                autoFocus
                className={selectClass}
                placeholder="Örn. Yiyecek ve içecek"
              />
            </div>
            {categoryError && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{categoryError}</p>}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button type="button" onClick={() => setIsCreatingCategory(false)} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">
                Vazgeç
              </button>
              <button type="submit" disabled={isSavingCategory} className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50">
                {isSavingCategory ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
