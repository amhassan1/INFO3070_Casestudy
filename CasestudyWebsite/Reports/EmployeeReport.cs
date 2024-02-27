using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.IO.Font.Constants;
using iText.Layout.Properties;
using iText.Layout.Borders;
using iText.IO.Image;
using iText.Kernel.Geom;
using HelpdeskViewModels;
namespace CasestudyWebsite.Reports
{
    public class EmployeeReport
    {
        readonly PdfFont helvetica = PdfFontFactory.CreateFont(StandardFontFamilies.HELVETICA);
        public async Task GenerateReport(string rootpath)
        {
            PageSize pg = PageSize.A4;
            Image img = new Image(ImageDataFactory.Create(rootpath + "/img/clipart4036501.png"))
            .SetWidth(128)
            .SetFixedPosition(((pg.GetWidth() - 128) / 2), 610);
            PdfWriter writer = new(rootpath + "/pdfs/Employeelist.pdf",
            new WriterProperties().SetPdfVersion(PdfVersion.PDF_2_0));
            PdfDocument pdf = new(writer);
            Document document = new(pdf); // PageSize(595, 842)
            document.Add(img);
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("Current Employees")
            .SetFont(helvetica)
            .SetFontSize(24)
           .SetBold()
            .SetTextAlignment(TextAlignment.CENTER));
            Table table = new(3);
            table
            .SetWidth(298) // roughly 50%
           .SetTextAlignment(TextAlignment.CENTER)
            .SetRelativePosition(0, 0, 0, 0)
           .SetHorizontalAlignment(HorizontalAlignment.CENTER);
            table.AddCell(AddCell("Title", "h", 0));
            table.AddCell(AddCell("Firstname", "h", 0));
            table.AddCell(AddCell("Lastname", "h", 0));
            table.AddCell(AddCell(" ", "d"));
            table.AddCell(AddCell(" ", "d"));
            table.AddCell(AddCell(" ", "d"));
            EmployeeViewModel employee = new();
            List<EmployeeViewModel> employees = await employee.GetAll();
            foreach (EmployeeViewModel stu in employees)
            {
                table.AddCell(AddCell(stu.Title!, "d", 8));
                table.AddCell(AddCell(stu.Firstname!, "d"));
                table.AddCell(AddCell(stu.Lastname!, "d"));
            }
            document.Add(table);
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("\n"));
            document.Add(new Paragraph("Employee report written on - " + DateTime.Now)
            .SetFontSize(6)
            .SetTextAlignment(TextAlignment.CENTER));
            document.Close();
        }
        private static Cell AddCell(string data, string celltype, int padLeft = 16)
        {
            Cell cell;
            if (celltype == "h")
            {
                cell = new Cell().Add(
                new Paragraph(data)
               .SetFontSize(16)
               .SetTextAlignment(TextAlignment.LEFT)
               .SetBold()
               )
               .SetBorder(Border.NO_BORDER);
            }
            else
            {
                cell = new Cell().Add(
                new Paragraph(data)
               .SetFontSize(14)
               .SetTextAlignment(TextAlignment.LEFT)
                .SetPaddingLeft(padLeft)
                )
               .SetBorder(Border.NO_BORDER);
            }
            return cell;
        }
    }
}