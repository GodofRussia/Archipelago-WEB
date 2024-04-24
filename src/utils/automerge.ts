import {Repo} from '@automerge/automerge-repo';
import {from} from '@automerge/automerge/dist/next';
import * as A from '@automerge/automerge';
import {NoteDoc} from '../types/notes';

export function createAutomergeUrl(repo: Repo) {
    const nextDoc = from({text: new A.Text()});
    const handle = repo.create<NoteDoc>(nextDoc);

    return handle.url;
}
