/**
 * 医療機関の設定
 *
 * 導入時にこのファイル（または設定画面）を編集してください。
 * 設定画面で変更した内容は localStorage に保存され、このファイルの値を上書きします。
 */

export interface ExerciseProgram {
  id: string
  name: string
  /** 患者向けの説明 */
  description: string
  /** 曜日・時間 */
  schedule: string
  /** 所要時間 */
  duration: string
  /** 担当 */
  staff: string
  /** 費用の説明 */
  cost: string
  /** 対象 */
  target: string
}

export interface ClinicConfig {
  name: string
  department: string
  postalCode: string
  address: string
  tel: string
  telNote: string
  fax: string
  url: string
  /** 患者用の再確認ページ（院内LANの静的ページや院のWebサイト）。QRコードに埋め込む */
  patientPageUrl: string
  hours: string
  closed: string
  /** 診察時間外の連絡先 */
  emergencyContact: string
  /** 当院の特色（パンフレット表紙に印字） */
  tagline: string
  /** 運動療法プログラム */
  programs: ExerciseProgram[]
  /** 連携している歯科・薬局・専門医療機関 */
  partners: { kind: string; name: string; note: string }[]
  /** リハビリスタッフ体制 */
  rehabStaff: string
  /** 骨粗鬆症マネージャーの在籍 */
  olsNote: string
  /**
   * 問診システム（monshin-tablet）のURL。
   * 空文字 = せつめいナビと同じサーバーから配信されている（推奨構成）。
   * 別のサーバーから使う場合のみ 'http://192.168.1.20:8090' のように指定する
   * （その場合は問診サーバー側に CORS の設定が必要）。
   */
  monshinBaseUrl: string
  /** 問診システムとの連携を使うか */
  monshinEnabled: boolean
  /**
   * DAS28-CRP の活動性区分に使うカットオフ。
   * 院内の問診システムは慣用基準（2.6/3.2/5.1）を使っているため、既定を 'classic' にしている。
   */
  das28crpThresholds: 'classic' | 'crpAdjusted'
}

export const DEFAULT_CLINIC: ClinicConfig = {
  name: '〇〇整形外科クリニック',
  department: '整形外科・リウマチ科・リハビリテーション科',
  postalCode: '000-0000',
  address: '〇〇県〇〇市〇〇町0-0-0',
  tel: '000-000-0000',
  telNote: '受付時間内におかけください',
  fax: '000-000-0000',
  url: 'https://example.clinic',
  patientPageUrl: 'https://example.clinic/patient',
  hours: '午前 9:00〜12:30 ／ 午後 15:00〜18:00',
  closed: '木曜午後・土曜午後・日曜・祝日',
  emergencyContact: '診療時間外の急な症状は、お住まいの地域の救急相談窓口（#7119 など）または救急外来へご連絡ください。',
  tagline: '運動療法に力を入れています ― 薬だけに頼らない、動ける身体づくり',
  programs: [
    {
      id: 'undouki-reha',
      name: '運動器リハビリテーション（個別）',
      description:
        '理学療法士が一人ひとりの状態を評価し、あなたの身体に合った運動を1対1で指導します。自宅での運動のやり方も細かくお伝えします。',
      schedule: '平日 9:00〜12:00 / 15:00〜17:30（予約制）',
      duration: '1回20〜40分',
      staff: '理学療法士',
      cost: '健康保険が使えます（3割負担で1回およそ600〜1,200円）',
      target: '医師が必要と判断した方（骨粗鬆症・関節リウマチ・変形性関節症・ロコモなど）',
    },
    {
      id: 'bone-class',
      name: '骨を強くする運動教室（集団）',
      description:
        '骨粗鬆症の方を対象に、バランス運動・スクワット・背すじの運動を、仲間と一緒に楽しく続けられる教室です。栄養のミニ講座もあります。',
      schedule: '毎週〇曜日 14:00〜15:00',
      duration: '60分',
      staff: '理学療法士・管理栄養士・骨粗鬆症マネージャー',
      cost: '要確認（自費の場合は院内掲示の金額）',
      target: '骨粗鬆症・骨量減少と診断された方',
    },
    {
      id: 'locomo-class',
      name: 'ロコモ予防教室（集団）',
      description:
        'ロコモ度テストで移動機能の低下が見つかった方を対象に、下肢の筋力とバランスを取り戻すプログラムを行います。',
      schedule: '毎週〇曜日 10:30〜11:30',
      duration: '60分',
      staff: '理学療法士',
      cost: '要確認',
      target: 'ロコモ度1〜2の方',
    },
    {
      id: 'ra-hand-class',
      name: 'リウマチの手のリハビリ相談',
      description:
        '手指の関節を守る使い方、自助具の選び方、装具の相談を作業療法士・理学療法士が個別に行います。',
      schedule: '月〇回（予約制）',
      duration: '30分',
      staff: '理学療法士・作業療法士',
      cost: '健康保険が使えます',
      target: '関節リウマチの方',
    },
  ],
  partners: [
    { kind: '歯科', name: '（連携歯科医院名）', note: '骨吸収抑制薬の開始前・治療中の口腔管理をお願いしています。' },
    { kind: '薬局', name: '（連携薬局名）', note: '服薬状況の共有、飲み忘れ対策の相談ができます。' },
    { kind: 'リウマチ専門医療機関', name: '（連携先病院名）', note: '生物学的製剤の導入や難治例のご相談をしています。' },
    { kind: '救急・手術', name: '（連携先病院名）', note: '骨折や手術が必要な場合の紹介先です。' },
  ],
  rehabStaff: '理学療法士 〇名・作業療法士 〇名',
  olsNote: '骨粗鬆症マネージャー（日本骨粗鬆症学会認定）が在籍し、治療の継続をサポートします。',
  monshinBaseUrl: '',
  monshinEnabled: true,
  das28crpThresholds: 'classic',
}

const STORAGE_KEY = 'setsumei-navi:clinic'

export function loadClinic(): ClinicConfig {
  if (typeof localStorage === 'undefined') return DEFAULT_CLINIC
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CLINIC
    const parsed = JSON.parse(raw) as Partial<ClinicConfig>
    return { ...DEFAULT_CLINIC, ...parsed }
  } catch {
    return DEFAULT_CLINIC
  }
}

export function saveClinic(config: ClinicConfig): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function resetClinic(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
