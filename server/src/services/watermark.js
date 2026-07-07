const archiver = require('archiver');

// product.file_path bir klasör olmalı (satılan eklentinin dosyaları içinde).
// Her indirmede bu klasör sıfırdan zip'lenir ve içine alıcıya özel bir
// license.txt eklenir. Böylece dağıtılan her zip alıcıya özel damgalanmış olur.
function streamWatermarkedZip({ productDir, productName, buyer, order, res }) {
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err) => {
    throw err;
  });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${productName.replace(/[^a-z0-9-_]+/gi, '_')}.zip"`
  );

  archive.pipe(res);

  archive.directory(productDir, false);

  const licenseText = [
    'Proces Media - Lisans Bilgisi',
    '================================',
    `Ürün: ${productName}`,
    `Sipariş No: ${order.id}`,
    `Alıcı: ${buyer.name || ''} <${buyer.email}>`,
    `İndirme Tarihi: ${new Date().toISOString()}`,
    '',
    'Bu dosya yalnızca yukarıdaki alıcı için satın alınmıştır.',
    'İzinsiz kopyalama, paylaşma veya yeniden satış yasaktır.',
  ].join('\n');

  archive.append(licenseText, { name: 'license.txt' });

  return archive.finalize();
}

module.exports = { streamWatermarkedZip };
