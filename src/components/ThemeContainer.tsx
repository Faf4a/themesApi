import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Chip, Breadcrumbs, Typography, Link, Card, CardContent, CardMedia, Grid, Skeleton, IconButton, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";

// ssr moment, react-json-view breaks completely with it
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

export default function ThemeContainer() {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(null);

    useEffect(() => {
        fetch("/api/themes", { cache: "no-cache" })
            .then((res) => res.json())
            .then((data) => {
                const sortedThemes = data.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
                setThemes(sortedThemes);
                if (loading) setLoading(false);
            })
            .catch((error) => console.error(error));
    }, [themes, loading]);

    const handleDelete = (themeId) => {
        fetch(`/api/manage/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: themeId })
        })
            .then((response) => {
                if (response.ok) {
                    setThemes(themes.filter((theme) => theme.id !== themeId));
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleEdit = (theme) => {
        setCurrentTheme(theme);
        setEditDialogOpen(true);
    };

    const handleUpdate = (theme) => {
        setEditDialogOpen(false);
        setLoading(true);
        fetch("/api/manage/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: theme.name, properties: theme })
        })
            .then((response) => response.json())
            .then((data) => {
                setThemes(themes.map((theme) => (theme.id === data.id ? data : theme)));
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.log(error);
            });
    };

    return (
        <>
            <CssBaseline />
            <Container>
                <main style={{ padding: "20px" }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/">
                            Home
                        </Link>
                        <Typography color="text.primary">Themes</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" gutterBottom>
                        Manage Themes
                    </Typography>
                    <Box mb={2} sx={{ width: "100%" }}>
                        {/* disabled for now until I add functionality */}
                        <TextField disabled fullWidth label="Search Themes" variant="outlined" />
                    </Box>
                    <Grid container spacing={3}>
                        {loading
                            ? Array.from(new Array(12)).map((_, index) => (
                                  <Grid item xs={12} sm={6} md={4} key={index}>
                                      <Skeleton variant="rectangular" width="100%" height={118} />
                                      <Skeleton width="60%" />
                                      <Skeleton width="40%" />
                                  </Grid>
                              ))
                            : themes.map((theme) => (
                                  <Grid item xs={12} sm={6} md={4} key={theme.id}>
                                      <Box sx={{ position: "relative" }}>
                                          <div style={{ overflow: "hidden" }}>
                                              <Card
                                                  sx={{
                                                      height: 300,
                                                      "&:hover": {
                                                          ".actionIcons": {
                                                              visibility: "visible"
                                                          }
                                                      }
                                                  }}
                                              >
                                                  <CardMedia component="img" height="140" image={theme.thumbnail_url} alt={theme.name} />
                                                  <CardContent>
                                                      <Typography gutterBottom variant="h5" component="div">
                                                          {theme.name}
                                                      </Typography>
                                                      <Typography
                                                          variant="body2"
                                                          color="text.secondary"
                                                          sx={{
                                                              display: "-webkit-box",
                                                              overflow: "hidden",
                                                              WebkitBoxOrient: "vertical",
                                                              WebkitLineClamp: 3,
                                                              textOverflow: "ellipsis",
                                                              height: "4em"
                                                          }}
                                                      >
                                                          {theme.description}
                                                      </Typography>
                                                  </CardContent>
                                                  <Box p={1} className="actionIcons" sx={{ position: "absolute", bottom: 0, right: 0, visibility: "hidden" }}>
                                                      <IconButton aria-label="delete" onClick={() => handleDelete(theme.id)} sx={{ color: "#FF6961" }}>
                                                          <DeleteIcon />
                                                      </IconButton>
                                                      <IconButton aria-label="edit" onClick={() => handleEdit(theme)} sx={{ color: "#fff" }}>
                                                          <EditIcon />
                                                      </IconButton>
                                                  </Box>
                                              </Card>
                                          </div>
                                      </Box>
                                  </Grid>
                              ))}
                    </Grid>
                    <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                        <DialogTitle>Edit Theme</DialogTitle>
                        <DialogContent>
                            {currentTheme && (
                                <Box p={2} style={{ overflowY: "auto", maxHeight: "400px" }}>
                                    <DynamicReactJson src={currentTheme} theme="flat" iconStyle="square" onEdit={(edit) => setCurrentTheme(edit.updated_src)} onAdd={(add) => setCurrentTheme(add.updated_src)} onDelete={(del) => setCurrentTheme(del.updated_src)} />
                                </Box>
                            )}
                            {currentTheme && (
                                <>
                                    <hr />
                                    <Typography variant="body1" gutterBottom>
                                        Tags
                                    </Typography>
                                    {currentTheme.tags.map((tag: string, index: number) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            onDelete={() => {
                                                const newTags = currentTheme.tags.filter((x: string) => x !== tag);
                                                currentTheme.tags = newTags;
                                                setCurrentTheme(currentTheme);
                                            }}
                                            variant="outlined"
                                            style={{ marginLeft: "2px" }}
                                        />
                                    ))}
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={() => handleUpdate(currentTheme)}>Update</Button>
                        </DialogActions>
                    </Dialog>
                </main>
            </Container>
        </>
    );
}
