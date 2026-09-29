/// Printing abstraction for the customer receipt and the kitchen ticket.
///
/// Phase 1 defines the contract only. The printer hardware and connection
/// (network / Bluetooth / USB) are not decided yet; concrete implementations
/// are added once they are. Screens never talk to a printer directly — they
/// build a [PrintDocument] and hand it to a [PrinterService], so the UI does not
/// change when the hardware does.
library;

enum PrintDocumentType { customerReceipt, kitchenTicket }

enum PrintAlign { start, center, end }

/// Layout-level building blocks, independent of any business entity.
/// Receipt/ticket builders (later phases) turn order data into these lines.
sealed class PrintLine {
  const PrintLine();
}

class PrintText extends PrintLine {
  const PrintText(
    this.text, {
    this.align = PrintAlign.start,
    this.bold = false,
    this.large = false,
  });
  final String text;
  final PrintAlign align;
  final bool bold;
  final bool large;
}

/// Two columns on one line, e.g. item name and amount.
class PrintRow extends PrintLine {
  const PrintRow(this.start, this.end, {this.bold = false});
  final String start;
  final String end;
  final bool bold;
}

class PrintDivider extends PrintLine {
  const PrintDivider();
}

class PrintFeed extends PrintLine {
  const PrintFeed([this.lines = 1]);
  final int lines;
}

class PrintDocument {
  const PrintDocument({
    required this.type,
    required this.lines,
    this.cutPaper = true,
  });
  final PrintDocumentType type;
  final List<PrintLine> lines;
  final bool cutPaper;
}

enum PrinterStatus { ready, offline, paperOut, error, notConfigured }

class PrintException implements Exception {
  PrintException(this.message, {this.status = PrinterStatus.error});
  final String message;
  final PrinterStatus status;

  @override
  String toString() => 'PrintException($status): $message';
}

abstract interface class PrinterService {
  Future<PrinterStatus> status();

  /// Prints [document] or throws [PrintException]. Must be safe to retry:
  /// callers decide whether a failed job is reprinted.
  Future<void> print(PrintDocument document);
}

/// Used until a real printer is configured: reports [PrinterStatus.notConfigured]
/// and refuses to print, so a missing printer is never silently ignored.
class UnconfiguredPrinterService implements PrinterService {
  const UnconfiguredPrinterService();

  @override
  Future<PrinterStatus> status() async => PrinterStatus.notConfigured;

  @override
  Future<void> print(PrintDocument document) async => throw PrintException(
        'No printer is configured on this device.',
        status: PrinterStatus.notConfigured,
      );
}
