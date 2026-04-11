import { Test, TestingModule } from '@nestjs/testing';
import { AuthCookieService } from '../auth/auth-cookie.service';
import { AuthSessionService } from '../auth/auth-session.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

describe('TrackingController', () => {
  let controller: TrackingController;
  let trackingService: {
    getTracking: jest.MockedFunction<TrackingService['getTracking']>;
    trackRedirectClick: jest.MockedFunction<
      TrackingService['trackRedirectClick']
    >;
  };
  let authSessionService: {
    getAuthenticatedUserId: jest.MockedFunction<
      AuthSessionService['getAuthenticatedUserId']
    >;
    ensureAuthenticated: jest.MockedFunction<
      AuthSessionService['ensureAuthenticated']
    >;
  };

  beforeEach(async () => {
    trackingService = {
      getTracking: jest.fn(),
      trackRedirectClick: jest.fn(),
    };
    authSessionService = {
      getAuthenticatedUserId: jest.fn(),
      ensureAuthenticated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [
        {
          provide: TrackingService,
          useValue: trackingService,
        },
        {
          provide: AuthSessionService,
          useValue: authSessionService,
        },
        {
          provide: AuthCookieService,
          useValue: {
            setAccessCookie: jest.fn(),
          },
        },
        AuthenticatedGuard,
      ],
    }).compile();

    controller = module.get<TrackingController>(TrackingController);
  });

  it('returns tracking only for the authenticated owner', async () => {
    authSessionService.getAuthenticatedUserId.mockResolvedValue(BigInt(7));
    trackingService.getTracking.mockResolvedValue({
      shortCode: 'abc1234',
      destinationUrl: 'https://example.com',
      totalClicks: 2,
      recentClicks: [],
    });

    const result = await controller.getTracking('abc1234', {
      userId: BigInt(7),
    } as never);

    expect(trackingService.getTracking).toHaveBeenCalledWith(
      'abc1234',
      BigInt(7),
    );
    expect(result.totalClicks).toBe(2);
  });
});
