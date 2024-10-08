export interface Theme {
    id: string;
    name: string;
    file_name: string;
    content: string;
    type: string | "theme" | "snippet";
    description: string;
    external_url?: string;
    download_url: string;
    version?: string;
    author: {
        github_name?: string;
        discord_name: string;
        discord_snowflake: string;
    };
    likes?: number;
    downloads?: number;
    tags: string[];
    thumbnail_url: string;
    release_date: string;
    guild?: {
        name: string;
        snowflake: string;
        invite_link: string;
        avatar_hash: string;
    };
    source?: string;
}