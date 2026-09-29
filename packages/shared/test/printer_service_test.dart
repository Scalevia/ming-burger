import 'package:flutter_test/flutter_test.dart';
import 'package:ming_shared/ming_shared.dart';

void main() {
  const doc = PrintDocument(
    type: PrintDocumentType.kitchenTicket,
    lines: [PrintText('#001', bold: true, large: true), PrintDivider()],
  );

  test('unconfigured printer reports its state and refuses to print', () async {
    const printer = UnconfiguredPrinterService();
    expect(await printer.status(), PrinterStatus.notConfigured);
    await expectLater(
      printer.print(doc),
      throwsA(isA<PrintException>()
          .having((e) => e.status, 'status', PrinterStatus.notConfigured)),
    );
  });
}
