// 필사(annotation)·게시글 데이터에서 도서명/작가명을 꺼내는 공통 함수
//
// 도서 정보는 두 가지 경로로 들어온다.
//   1) 사용자가 직접 입력한 값  → customBookTitle / customBookAuthor
//   2) 도서 검색으로 연결한 책  → bookId.title / bookId.author (백엔드 populate)
// 화면마다 이 규칙을 따로 적으면 한 곳만 고치고 나머지를 놓치기 쉬워서,
// 우선순위를 이 파일 한 곳에서만 관리한다.

type BookSource = {
  customBookTitle?: string;
  customBookAuthor?: string;
  bookTitle?: string;
  bookAuthor?: string;
  book_title?: string;
  book_author?: string;
  title?: string;
  author?: string;
  authorName?: string;
  bookId?: { title?: string; author?: string } | string | null;
} | null | undefined;

// bookId가 populate된 객체일 때만 안의 값을 꺼낸다 (문자열 ID면 무시)
const populatedBook = (item: BookSource) =>
  item && typeof item.bookId === 'object' && item.bookId !== null ? item.bookId : undefined;

/** 도서명: 직접 입력 → 검색한 책 → 기타 필드 순. 없으면 빈 문자열 */
export const getBookTitle = (item: BookSource): string =>
  item?.customBookTitle ||
  populatedBook(item)?.title ||
  item?.bookTitle ||
  item?.book_title ||
  item?.title ||
  '';

/** 작가명: 직접 입력 → 검색한 책 → 기타 필드 순. 없으면 빈 문자열 */
export const getBookAuthor = (item: BookSource): string =>
  item?.customBookAuthor ||
  populatedBook(item)?.author ||
  item?.bookAuthor ||
  item?.book_author ||
  item?.author ||
  item?.authorName ||
  '';
