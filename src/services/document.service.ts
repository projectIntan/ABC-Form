import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from "docx";
import { Declaration, ActivityType } from "../types";
import { formatRupiah, formatDate } from "../utils/formatters";
import { ACTIVITY_TYPES } from "../constants/activityTypes";

/**
 * Service to build and generate official Radiant Group ABC Declaration Form DOCX
 * adhering to template "ABC DF.docx" with strictly conditional activity sections.
 */
export class DeclarationDocumentService {
  /**
   * Generates a DOCX Document instance from saved Declaration data.
   */
  public static createDocument(declaration: Declaration): Document {
    const actMeta = ACTIVITY_TYPES.find(
      (a) => a.type === declaration.identity.activityType
    );
    const activityLabel = actMeta?.label || declaration.identity.activityType;
    const isInternal = declaration.identity.activityType === "INTERNAL";

    // Palette Colors
    const primaryNavy = "0F172A"; // Slate 900
    const accentSky = "0284C7";   // Sky 600
    const lightBg = "F8FAFC";     // Slate 50
    const borderGray = "CBD5E1";  // Slate 300
    const textDark = "1E293B";    // Slate 800
    const textMuted = "64748B";   // Slate 500

    // Table cell borders
    const standardBorder = {
      top: { style: BorderStyle.SINGLE, size: 1, color: borderGray },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: borderGray },
      left: { style: BorderStyle.SINGLE, size: 1, color: borderGray },
      right: { style: BorderStyle.SINGLE, size: 1, color: borderGray },
    };

    const headerBorder = {
      top: { style: BorderStyle.SINGLE, size: 2, color: primaryNavy },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: primaryNavy },
      left: { style: BorderStyle.SINGLE, size: 2, color: primaryNavy },
      right: { style: BorderStyle.SINGLE, size: 2, color: primaryNavy },
    };

    // Helper: Create 2-column key-value TableRow
    const createRow = (label: string, value: string, isHighlight = false): TableRow => {
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 36, type: WidthType.PERCENTAGE },
            borders: standardBorder,
            shading: { fill: lightBg },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label,
                    bold: true,
                    size: 20, // 10pt
                    color: textDark,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 64, type: WidthType.PERCENTAGE },
            borders: standardBorder,
            shading: isHighlight ? { fill: "F0F9FF" } : undefined, // Light sky highlight
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: value || "-",
                    bold: isHighlight,
                    size: 20, // 10pt
                    color: isHighlight ? accentSky : textDark,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    };

    // Helper: Section title paragraph
    const createSectionHeader = (title: string, sub?: string): Paragraph[] => {
      const paras: Paragraph[] = [
        new Paragraph({
          spacing: { before: 240, after: 80 },
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 24, // 12pt
              color: primaryNavy,
              font: "Arial",
            }),
          ],
        }),
      ];
      if (sub) {
        paras.push(
          new Paragraph({
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: sub,
                italics: true,
                size: 18, // 9pt
                color: textMuted,
                font: "Arial",
              }),
            ],
          })
        );
      }
      return paras;
    };

    // Document Header Information Block
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              borders: headerBorder,
              shading: { fill: lightBg },
              margins: { top: 140, bottom: 140, left: 160, right: 160 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "RADIANT GROUP",
                      bold: true,
                      size: 26, // 13pt
                      color: primaryNavy,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40 },
                  children: [
                    new TextRun({
                      text: "ANTI BRIBERY AND CORRUPTION DECLARATION FORM",
                      bold: true,
                      size: 20, // 10pt
                      color: accentSky,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Formulir Deklarasi Kepatuhan & Transparansi Kegiatan Bisnis",
                      size: 16, // 8pt
                      italics: true,
                      color: textMuted,
                      font: "Arial",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: headerBorder,
              shading: { fill: lightBg },
              margins: { top: 140, bottom: 140, left: 160, right: 160 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `KODE FORM: ${declaration.documentCode || "F-COMP-001-01"}`,
                      bold: true,
                      size: 18,
                      color: primaryNavy,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `No. Registrasi: `,
                      size: 16,
                      color: textMuted,
                      font: "Arial",
                    }),
                    new TextRun({
                      text: declaration.declarationNumber,
                      bold: true,
                      size: 18,
                      color: accentSky,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `Status: ${declaration.status}`,
                      bold: true,
                      size: 16,
                      color: declaration.status === "APPROVED" ? "15803D" : "B45309",
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `Tanggal: ${formatDate(
                        declaration.submittedDate || declaration.createdDate
                      )}`,
                      size: 16,
                      color: textDark,
                      font: "Arial",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // ----------------------------------------------------
    // Section A) IDENTITAS - Informasi Anda (Pelapor)
    // ----------------------------------------------------
    const identityRows: TableRow[] = [
      createRow("Entitas Perusahaan", declaration.identity.entity),
      createRow("SBU (Strategic Business Unit)", declaration.identity.sbu || "-"),
      createRow("Departemen", declaration.identity.department || "-"),
      createRow("Nama Karyawan", declaration.identity.fullName),
      createRow("Pangkat / Jabatan", declaration.identity.position || "-"),
      createRow("Employee ID / NIK", declaration.identity.employeeId),
      createRow("Email Resmi", declaration.identity.email),
      createRow("Jenis Kegiatan", activityLabel, true),
    ];

    const identityTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: identityRows,
    });

    // ----------------------------------------------------
    // Section A) IDENTITAS - Informasi Pihak Eksternal (CONDITIONAL)
    // ONLY rendered if activity involves external party (i.e. NOT INTERNAL)
    // ----------------------------------------------------
    const externalPartyElements: (Paragraph | Table)[] = [];
    if (!isInternal) {
      externalPartyElements.push(
        ...createSectionHeader(
          "Informasi Pihak Eksternal",
          "Rincian mitra bisnis, vendor, klien, atau instansi terkait kegiatan"
        )
      );

      const extRows: TableRow[] = [
        createRow(
          "Nama Perusahaan / Organisasi / Lembaga",
          declaration.externalParty.companyName || "-"
        ),
        createRow(
          "Hubungan dengan Radiant Group",
          declaration.externalParty.relationship || "-"
        ),
        createRow("Project Code", declaration.externalParty.projectCode || "-"),
        createRow(
          "Kategori Kegiatan",
          (declaration.externalParty as any).activityCategory ||
            (declaration.externalParty as any).category ||
            "-"
        ),
      ];

      externalPartyElements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: extRows,
        })
      );
    }

    // ----------------------------------------------------
    // Section B) KEGIATAN YANG DILAPORKAN (DYNAMIC / CONDITIONAL)
    // STRICT RULE: Render ONLY the section for selected activity type!
    // No other activity type sections shall be rendered!
    // ----------------------------------------------------
    const activityElements: (Paragraph | Table)[] = [
      ...createSectionHeader("B) KEGIATAN YANG DILAPORKAN"),
    ];

    const detail = declaration.activityDetail || {};
    const employeesListStr =
      detail.radiantEmployees && detail.radiantEmployees.length > 0
        ? detail.radiantEmployees
            .map((e) => `${e.fullName} (${e.positionName || "-"})`)
            .join("; ")
        : "-";

    const totalAmountVal =
      detail.totalAmount ||
      detail.estimatedPrice ||
      detail.sponsorshipAmount ||
      detail.facilitationAmount ||
      0;

    switch (declaration.identity.activityType) {
      // 1. Kegiatan Internal
      case "INTERNAL": {
        activityElements.push(
          ...createSectionHeader("1. Kegiatan Internal", "Khusus kegiatan & konsumsi karyawan internal Radiant Group")
        );
        const rows: TableRow[] = [
          createRow("Tanggal Pelaksanaan", formatDate(detail.date)),
          createRow("Deskripsi Kegiatan", detail.description || detail.purpose || "-"),
          createRow("Jenis Jamuan", detail.mealType || "-"),
          createRow("Jumlah Partisipan", detail.participantCount ? `${detail.participantCount} Orang` : "-"),
          createRow("Daftar Karyawan Radiant Group yang Hadir", employeesListStr),
          createRow("Total Keseluruhan Biaya", formatRupiah(totalAmountVal), true),
        ];
        activityElements.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        break;
      }

      // 2. Jamuan Makan dengan Pihak Eksternal
      case "EXTERNAL_MEAL": {
        activityElements.push(
          ...createSectionHeader(
            "2. Jamuan Makan dengan Pihak Eksternal",
            "Makan siang/malam bisnis dan jamuan bersama pihak ketiga"
          )
        );
        const rows: TableRow[] = [
          createRow("Tanggal Pelaksanaan", formatDate(detail.date)),
          createRow("Lokasi Pelaksanaan", detail.location || "-"),
          createRow("Tujuan Kegiatan", detail.purpose || "-"),
          createRow("Ringkasan Rapat / Agenda", detail.summaryMeeting || "-"),
          createRow("Jumlah Partisipan yang Hadir", detail.participantCount ? `${detail.participantCount} Orang` : "-"),
          createRow("Daftar Nama Karyawan Radiant Group yang Hadir", employeesListStr),
          createRow("Jenis Jamuan", detail.mealType || "-"),
          createRow("Total Keseluruhan Biaya", formatRupiah(totalAmountVal), true),
        ];
        activityElements.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        break;
      }

      // 3. Hadiah dari/kepada Pihak Eksternal
      case "GIFT": {
        activityElements.push(
          ...createSectionHeader(
            "3. Hadiah dari/kepada Pihak Eksternal",
            "Pemberian atau penerimaan cenderamata, bingkisan, atau hadiah bisnis"
          )
        );
        const rows: TableRow[] = [
          createRow("Tanggal Menerima/Memberi Hadiah", formatDate(detail.date)),
          createRow("Deskripsi Hadiah", detail.description || "-"),
          createRow("Alasan Menerima/Memberi Hadiah", detail.giftReason || detail.purpose || "-"),
          createRow("Kuantitas (Jumlah Unit)", detail.quantity ? `${detail.quantity} Unit` : "1 Unit"),
          createRow("Estimasi Harga / Nilai", formatRupiah(totalAmountVal), true),
        ];
        activityElements.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        break;
      }

      // 4. Kegiatan Rekreasional dengan Pihak Eksternal
      case "RECREATIONAL": {
        activityElements.push(
          ...createSectionHeader(
            "4. Kegiatan Rekreasional dengan Pihak Eksternal",
            "Olahraga, golf, outing, atau hiburan bersama mitra eksternal"
          )
        );
        const rows: TableRow[] = [
          createRow("Tanggal Pelaksanaan", formatDate(detail.date)),
          createRow("Lokasi", detail.location || "-"),
          createRow("Tujuan Kegiatan", detail.purpose || "-"),
          createRow("Jenis Rekreasi / Olahraga", (detail as any).recreationalType || "-"),
          createRow("Jumlah Partisipan yang Hadir", detail.participantCount ? `${detail.participantCount} Orang` : "-"),
          createRow("Daftar Nama Karyawan Radiant Group yang Hadir", employeesListStr),
          createRow("Total Keseluruhan Biaya", formatRupiah(totalAmountVal), true),
        ];
        activityElements.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        break;
      }

      // 5. Sponsor/Donasi
      case "SPONSORSHIP": {
        activityElements.push(
          ...createSectionHeader(
            "5. Sponsor / Donasi",
            "Dukungan dana sosial, CSR, sponsorship acara, atau bantuan"
          )
        );
        const rows: TableRow[] = [
          createRow("Tanggal Pemberian Sponsor/Donasi", formatDate(detail.date)),
          createRow("Alasan / Tujuan Pemberian Sponsor/Donasi", detail.sponsorshipReason || detail.purpose || "-"),
          createRow("Nama Penerima / Lembaga", (detail as any).recipientName || declaration.externalParty.companyName || "-"),
          createRow("Nominal Sponsor / Donasi", formatRupiah(totalAmountVal), true),
        ];
        activityElements.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        break;
      }

      // 6. Pembayaran Fasilitasi
      case "FACILITATION": {
        activityElements.push(
          ...createSectionHeader(
            "6. Pembayaran Fasilitasi",
            "Biaya fasilitasi atau administrasi resmi sesuai ketentuan hukum"
          )
        );
        const rows: TableRow[] = [
          createRow("Tanggal Pembayaran Fasilitasi", formatDate(detail.date)),
          createRow("Alasan Pembayaran Fasilitasi", detail.facilitationReason || detail.purpose || "-"),
          createRow("Instansi / Tujuan Pembayaran", (detail as any).agencyName || declaration.externalParty.companyName || "-"),
          createRow("Nominal Pembayaran Fasilitasi", formatRupiah(totalAmountVal), true),
        ];
        activityElements.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        break;
      }

      // 7. Menerima Hiburan dari Pihak Eksternal
      case "ENTERTAINMENT": {
        activityElements.push(
          ...createSectionHeader(
            "7. Menerima Hiburan dari Pihak Eksternal",
            "Penerimaan fasilitas hiburan, tiket konser, atau pertunjukan dari mitra"
          )
        );
        const rows: TableRow[] = [
          createRow("Jenis Hiburan yang Diterima", detail.entertainmentType || "-"),
          createRow("Tanggal Pelaksanaan Penerimaan Hiburan", formatDate(detail.date)),
          createRow("Alasan Penerimaan Hiburan", detail.entertainmentReason || detail.purpose || "-"),
          createRow("Nama Tempat Hiburan dari Pihak Eksternal", detail.entertainmentVenue || detail.location || "-"),
          createRow("Estimasi Nilai Hiburan", formatRupiah(totalAmountVal), true),
        ];
        activityElements.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        break;
      }

      default: {
        activityElements.push(
          ...createSectionHeader(`Detail Kegiatan: ${activityLabel}`)
        );
        const rows: TableRow[] = [
          createRow("Tanggal Kegiatan", formatDate(detail.date)),
          createRow("Deskripsi / Tujuan", detail.purpose || detail.description || "-"),
          createRow("Total Nominal Biaya", formatRupiah(totalAmountVal), true),
        ];
        activityElements.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        break;
      }
    }

    // ----------------------------------------------------
    // Section C) DEKLARASI KEPATUHAN DAN TRANSPARANSI
    // ----------------------------------------------------
    const declarationStatementBox = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: headerBorder,
              shading: { fill: "F8FAFC" },
              margins: { top: 160, bottom: 160, left: 180, right: 180 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "DEKLARASI KEPATUHAN DAN TRANSPARANSI",
                      bold: true,
                      size: 20,
                      color: primaryNavy,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [
                    new TextRun({
                      text: "Dengan ini saya menyatakan bahwa seluruh informasi yang disampaikan dalam formulir deklarasi ini adalah benar, lengkap, dan sesuai dengan fakta yang sebenarnya. Kegiatan ini dilaksanakan tanpa ada unsur suap, gratifikasi terlarang, pemerasan, konflik kepentingan, atau pelanggaran terhadap Kebijakan Anti-Bribery & Corruption (ABC) PT Radiant Utama Interinsco Tbk / Radiant Group serta peraturan perundang-undangan yang berlaku.",
                      size: 18,
                      font: "Arial",
                      color: textDark,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40 },
                  children: [
                    new TextRun({
                      text: "I hereby declare that all information provided in this declaration form is true, complete, and accurate. This activity was conducted without any bribery, unlawful gratuity, extortion, conflict of interest, or violation of the Anti-Bribery & Corruption (ABC) Policy of Radiant Group and applicable laws.",
                      size: 16,
                      italics: true,
                      font: "Arial",
                      color: textMuted,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // Signature Block Table
    const signatureTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: standardBorder,
              shading: { fill: lightBg },
              margins: { top: 140, bottom: 140, left: 160, right: 160 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Pernyataan Pelapor / Submitter:",
                      bold: true,
                      size: 18,
                      color: primaryNavy,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 80 },
                  children: [
                    new TextRun({
                      text: `Nama: ${declaration.identity.fullName}`,
                      bold: true,
                      size: 18,
                      color: textDark,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `NIK: ${declaration.identity.employeeId}`,
                      size: 16,
                      color: textMuted,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Jabatan: ${declaration.identity.position || "-"}`,
                      size: 16,
                      color: textMuted,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Entitas: ${declaration.identity.entity}`,
                      size: 16,
                      color: textMuted,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 60 },
                  children: [
                    new TextRun({
                      text: `Tanggal Submit: ${formatDate(
                        declaration.submittedDate || declaration.createdDate
                      )}`,
                      bold: true,
                      size: 16,
                      color: accentSky,
                      font: "Arial",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: standardBorder,
              shading: { fill: lightBg },
              margins: { top: 140, bottom: 140, left: 160, right: 160 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Penatausahaan Kepatuhan (Compliance):",
                      bold: true,
                      size: 18,
                      color: primaryNavy,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 80 },
                  children: [
                    new TextRun({
                      text: `No. Registrasi: ${declaration.declarationNumber}`,
                      bold: true,
                      size: 18,
                      color: accentSky,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `No. Beban ERP: ${declaration.expenseNumber || "Menunggu Persetujuan"}`,
                      size: 16,
                      color: textDark,
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Status Sistem: ${
                        declaration.status === "APPROVED"
                          ? "APPROVED (Disetujui Otomatis)"
                          : "SUBMITTED (Menunggu Verifikasi Compliance)"
                      }`,
                      bold: true,
                      size: 16,
                      color: declaration.status === "APPROVED" ? "15803D" : "B45309",
                      font: "Arial",
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 60 },
                  children: [
                    new TextRun({
                      text: "✓ Terverifikasi Digital Sistem Portal ABC Radiant Group",
                      italics: true,
                      size: 15,
                      color: "15803D",
                      font: "Arial",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    // Assemble the complete DOCX Document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,    // 0.5 inch
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `RADIANT GROUP — ANTI BRIBERY & CORRUPTION DECLARATION (${declaration.documentCode || "F-COMP-001-01"})`,
                      size: 14,
                      color: textMuted,
                      font: "Arial",
                    }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      text: `Dokumen Resmi Kepatuhan ABC — ${declaration.declarationNumber} — Rahasia & Mengikat`,
                      size: 14,
                      color: textMuted,
                      font: "Arial",
                    }),
                    new TextRun({
                      text: " | Hal. ",
                      size: 14,
                      color: textMuted,
                      font: "Arial",
                    }),
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 14,
                      font: "Arial",
                      color: textMuted,
                    }),
                  ],
                }),
              ],
            }),
          },
          children: [
            // 1. Header Banner Table
            headerTable,

            // 2. Section A) IDENTITAS
            ...createSectionHeader(
              "A) IDENTITAS",
              "Informasi identitas pelapor dan unit organisasi Radiant Group"
            ),
            identityTable,

            // 3. Informasi Pihak Eksternal (CONDITIONAL)
            ...externalPartyElements,

            // 4. Section B) KEGIATAN YANG DILAPORKAN (CONDITIONAL TO SELECTED ACTIVITY)
            ...activityElements,

            // 5. Deklarasi Kepatuhan & Tanda Tangan
            ...createSectionHeader("C) PERNYATAAN & PENGESAHAN"),
            declarationStatementBox,

            new Paragraph({ spacing: { before: 140 } }),
            signatureTable,
          ],
        },
      ],
    });

    return doc;
  }

  /**
   * Generates a Blob representing the DOCX file in browser environments.
   */
  public static async generateDocumentBlob(declaration: Declaration): Promise<Blob> {
    const doc = this.createDocument(declaration);
    return await Packer.toBlob(doc);
  }

  /**
   * Generates a Node.js Buffer representing the DOCX file.
   */
  public static async generateDocumentBuffer(declaration: Declaration): Promise<Buffer> {
    const doc = this.createDocument(declaration);
    return await Packer.toBuffer(doc);
  }

  /**
   * Helper to compute standardized file name: ABC_Declaration_[RegistrationNumber].docx
   */
  public static getFileName(declaration: Declaration): string {
    const sanitizedNumber = (declaration.declarationNumber || "DRAFT").replace(
      /[/\\?%*:|"<>]/g,
      "_"
    );
    return `ABC_Declaration_${sanitizedNumber}.docx`;
  }

  /**
   * Triggers a browser download of the generated DOCX.
   */
  public static async downloadDocument(declaration: Declaration): Promise<void> {
    const blob = await this.generateDocumentBlob(declaration);
    const fileName = this.getFileName(declaration);

    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    }
  }
}
