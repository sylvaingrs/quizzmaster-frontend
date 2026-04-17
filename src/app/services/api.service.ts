import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, timer } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  Quiz,
  Question,
  CreateQuestionDto,
  Room,
  GameStep,
  BuzzResponse,
  AnswerResponse,
  LeaderboardResponse,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Retry requests that fail due to upstream services not ready */
  private withRetry<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      retry({ count: 2, delay: () => timer(1000) })
    );
  }

  // --- Quiz ---
  createQuiz(title: string): Observable<Quiz> {
    return this.withRetry(this.http.post<Quiz>(`${this.baseUrl}/quizz/quizz`, { title }));
  }

  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.baseUrl}/quizz/quizz`);
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/quizz/quizz/${id}`);
  }

  deleteQuiz(id: number): Observable<Quiz> {
    return this.http.delete<Quiz>(`${this.baseUrl}/quizz/quizz/${id}`);
  }

  // --- Questions ---
  getQuestions(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(
      `${this.baseUrl}/quizz/quizz/${quizId}/questions`
    );
  }

  createQuestion(
    quizId: number,
    dto: CreateQuestionDto
  ): Observable<Question> {
    return this.withRetry(this.http.post<Question>(
      `${this.baseUrl}/quizz/quizz/${quizId}/questions`,
      dto
    ));
  }

  updateQuestion(
    quizId: number,
    questionId: number,
    dto: Partial<CreateQuestionDto>
  ): Observable<Question> {
    return this.http.patch<Question>(
      `${this.baseUrl}/quizz/quizz/${quizId}/questions/${questionId}`,
      dto
    );
  }

  deleteQuestion(quizId: number, questionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/quizz/quizz/${quizId}/questions/${questionId}`
    );
  }

  // --- Room ---
  createRoom(quizId: number, pseudo: string): Observable<Room> {
    return this.withRetry(this.http.post<Room>(`${this.baseUrl}/room`, { quizId, pseudo }));
  }

  getRoom(roomId: string): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/room/${roomId}`);
  }

  joinRoom(
    roomId: string,
    pseudo: string,
    role: 'PLAYER' | 'SPECTATOR'
  ): Observable<Room> {
    return this.withRetry(this.http.post<Room>(`${this.baseUrl}/room/${roomId}/join`, {
      pseudo,
      role,
    }));
  }

  startGame(roomId: string): Observable<GameStep> {
    return this.withRetry(this.http.post<GameStep>(
      `${this.baseUrl}/room/${roomId}/start`,
      {}
    ));
  }

  nextQuestion(roomId: string): Observable<GameStep> {
    return this.http.post<GameStep>(
      `${this.baseUrl}/room/${roomId}/next`,
      {}
    );
  }

  endGame(roomId: string): Observable<{ room: string; status: string }> {
    return this.http.post<{ room: string; status: string }>(
      `${this.baseUrl}/room/${roomId}/end`,
      {}
    );
  }

  // --- Buzzer ---
  buzz(roomId: string, userId: string): Observable<BuzzResponse> {
    return this.http.post<BuzzResponse>(
      `${this.baseUrl}/room/buzzer/${roomId}/buzz`,
      { userId }
    );
  }

  answer(
    roomId: string,
    userId: string,
    answer: string[]
  ): Observable<AnswerResponse> {
    return this.http.post<AnswerResponse>(
      `${this.baseUrl}/room/buzzer/${roomId}/answer`,
      { userId, answer }
    );
  }

  // --- Leaderboard ---
  getLeaderboard(roomId: string): Observable<LeaderboardResponse> {
    return this.http.get<LeaderboardResponse>(
      `${this.baseUrl}/room/leaderboard/${roomId}`
    );
  }
}
