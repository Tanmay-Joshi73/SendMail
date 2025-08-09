declare module 'node-file-dialog'{
    export interface ndf_options{
          type: 'open-file' | 'save-file' | 'open-directory',
          mimeTypes?: string[];
          multiple?:true | false
          defaultPath?: string; 

    }
    export default function nfd(options:ndf_options):Promise<string[]>
}