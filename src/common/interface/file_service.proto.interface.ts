import { Observable } from 'rxjs';
import { CreateFilePartRequestDTO__Output } from 'src/pb/file/CreateFilePartRequestDTO';
import { CreateFileRequestDTO__Output } from 'src/pb/file/CreateFileRequestDTO';
import { File__Output } from 'src/pb/file/File';
import { GetBySlugRequestDTO__Output } from 'src/pb/file/GetBySlugRequestDTO';
import { GetFilesRequestDTO } from 'src/pb/file/GetFilesRequestDTO';
import { SetLoadingRequestDTO__Output } from 'src/pb/file/SetLoadingRequestDTO';
import { Int32Value__Output } from 'src/pb/google/protobuf/Int32Value';

export interface IFileServiceMS {
  CreateFile(data: CreateFileRequestDTO__Output): Observable<File__Output>;
  CreateFilePart(
    data: CreateFilePartRequestDTO__Output,
  ): Observable<Int32Value__Output>;
  SetLoading(
    data: SetLoadingRequestDTO__Output,
  ): Observable<Int32Value__Output>;
  GetBySlug(data: GetBySlugRequestDTO__Output): Observable<File__Output>;
  GetFiles(data: GetFilesRequestDTO): Observable<File>;
}
