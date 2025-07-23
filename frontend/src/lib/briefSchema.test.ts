import { BriefSchema } from './types';

describe('BriefSchema', () => {
  it('should parse valid brief object', () => {
    const validBrief = {
      instanceId: 'i1',
      productId: 'p1',
      productName: 'Produk 1',
      tier: 'Kaki Lima',
      briefDetails: 'Deskripsi cukup panjang',
      googleDriveAssetLinks: 'https://drive.google.com/file/d/abc123',
      width: 10,
      height: 10,
      unit: 'px',
    };
    expect(() => BriefSchema.parse(validBrief)).not.toThrow();
  });
}); 