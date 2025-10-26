import { getPermafrostDataAction } from '../src/app/actions/analysis';
import { getPredictionsAction } from '../src/app/actions/prediction';
import { getRiskAssessmentsAction } from '../src/app/actions/reporting';
import { SupabaseService } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  SupabaseService: {
    getPermafrostData: jest.fn(),
    getPredictions: jest.fn(),
    getRiskAssessments: jest.fn(),
  },
}));

describe('Action Error Handling', () => {
  it('should re-throw the original error from getPermafrostDataAction', async () => {
    const errorMessage = 'Supabase error';
    (SupabaseService.getPermafrostData as jest.Mock).mockRejectedValue(new Error(errorMessage));
    await expect(getPermafrostDataAction()).rejects.toThrow(errorMessage);
  });

  it('should re-throw the original error from getPredictionsAction', async () => {
    const errorMessage = 'Supabase error';
    (SupabaseService.getPredictions as jest.Mock).mockRejectedValue(new Error(errorMessage));
    await expect(getPredictionsAction()).rejects.toThrow(errorMessage);
  });

  it('should re-throw the original error from getRiskAssessmentsAction', async () => {
    const errorMessage = 'Supabase error';
    (SupabaseService.getRiskAssessments as jest.Mock).mockRejectedValue(new Error(errorMessage));
    await expect(getRiskAssessmentsAction()).rejects.toThrow(errorMessage);
  });
});
