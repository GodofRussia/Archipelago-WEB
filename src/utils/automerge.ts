import {Repo} from '@automerge/automerge-repo';
import * as A from '@automerge/automerge';
import {NoteDoc} from '../types/notes';

export function createAutomergeUrl(repo: Repo) {
    const nextDoc = A.from({text: ''});
    const handle = repo.create<NoteDoc>(nextDoc as unknown as NoteDoc);

    return handle.url;
}
