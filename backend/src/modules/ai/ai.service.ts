import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, map, Observable, of, retry } from 'rxjs';
import { MatchScoreRequest } from './dto/matchingScoreRequest.dto';
import { matchScoreResponse } from './dto/score.dto';

@Injectable()
export class AiService {
  constructor(private readonly httpService: HttpService) {}

  private readonly baseUrl = 'http://127.0.0.1:8000/api';

  getMatchingScore(data: MatchScoreRequest): Observable<any> {
    const url = this.baseUrl + '/matching-score';
    const response = this.httpService.post(url, data);

    return response.pipe(
      map((res) => res.data.score),
      retry(3),
      catchError((err) => {
        return of({ score: 0 });
      }),
    );
  }
}
