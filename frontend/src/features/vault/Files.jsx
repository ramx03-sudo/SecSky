import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getFiles, deleteFile, uploadFile, fetchFileBlob, getFolders, createFolder, deleteFolder, renameFolder, moveFile, moveFolder } from '../../utils/api';
import { encryptFileFlow, decryptFileFlow, decryptString, encryptString } from '../../utils/crypto';
import { UploadCloud, File, Trash2, Download, Lock, X, Loader2, CheckCircle2, Shield, HardDrive, Calendar, Eye, Folder, FolderPlus, ChevronRight, Edit3, ArrowLeft, CornerDownRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const getMimeType = (filename) => {
    if (!filename) return 'application/octet-stream';
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'json': 'application/json',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
    };
    return mimeTypes[ext] || 'application/octet-stream';
};

export default function Files() {
    const { masterKey } = useAuth();
    const [allFiles, setAllFiles] = useState([]);
    const [allFolders, setAllFolders] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    const [currentFolder, setCurrentFolder] = useState(null); // null = Root

    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [useFilePassword, setUseFilePassword] = useState(false);
    const [filePassword, setFilePassword] = useState('');
    const [uploadStatus, setUploadStatus] = useState('');

    // Folder Modal State
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [folderAction, setFolderAction] = useState('create'); // 'create' or folder id to 'rename'
    const [isSubmittingFolder, setIsSubmittingFolder] = useState(false);

    // Download & Preview State
    const [downloadingId, setDownloadingId] = useState(null);
    const [viewingId, setViewingId] = useState(null);
    const [promptPasswordForId, setPromptPasswordForId] = useState(null);
    const [downloadPassword, setDownloadPassword] = useState('');
    const [promptAction, setPromptAction] = useState('download'); // 'download' or 'view'

    // Move Modal State
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [itemToMove, setItemToMove] = useState(null); // { id: '...', type: 'file' | 'folder', name: '...' }
    const [selectedDestinationFolder, setSelectedDestinationFolder] = useState(null);
    const [isMoving, setIsMoving] = useState(false);

    // Preview Modal State
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchVaultData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchVaultData = async () => {
        try {
            setLoadingList(true);
            const [fileData, folderData] = await Promise.all([getFiles(), getFolders()]);

            const decryptedFiles = await Promise.all(fileData.map(async f => {
                try {
                    const name = await decryptString(f.filename, f.filename_iv, masterKey);
                    return { ...f, decryptedName: name };
                } catch {
                    return { ...f, decryptedName: 'Encrypted File' };
                }
            }));

            const decryptedFolders = await Promise.all(folderData.map(async f => {
                try {
                    const name = await decryptString(f.name_encrypted, f.name_iv, masterKey);
                    return { ...f, decryptedName: name };
                } catch {
                    return { ...f, decryptedName: 'Encrypted Folder' };
                }
            }));

            // Sort by created_at descending
            decryptedFiles.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            decryptedFolders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

            setAllFiles(decryptedFiles);
            setAllFolders(decryptedFolders);
        } catch {
            toast.error("Failed to load vault data");
        } finally {
            setLoadingList(false);
        }
    };

    // Derived standard view properties
    const currentFiles = allFiles.filter(f => (f.folder_id || null) === currentFolder);
    const currentFoldersList = allFolders.filter(f => (f.parent_id || null) === currentFolder);

    const getBreadcrumbs = () => {
        const crumbs = [];
        let curr = currentFolder;
        while (curr) {
            const f = allFolders.find(x => x.id === curr);
            if (f) {
                crumbs.unshift(f);
                curr = f.parent_id || null;
            } else {
                break;
            }
        }
        return crumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    // Folder Actions
    const handleFolderSubmit = async (e) => {
        e.preventDefault();
        if (!folderName.trim()) return;
        if (!masterKey) return;

        setIsSubmittingFolder(true);
        try {
            const { encryptedBase64, ivBase64 } = await encryptString(folderName.trim(), masterKey);

            if (folderAction === 'create') {
                await createFolder({
                    name_encrypted: encryptedBase64,
                    name_iv: ivBase64,
                    parent_id: currentFolder
                });
                toast.success('Folder created');
            } else {
                await renameFolder(folderAction, {
                    name_encrypted: encryptedBase64,
                    name_iv: ivBase64
                });
                toast.success('Folder renamed');
            }
            setShowFolderModal(false);
            fetchVaultData();
        } catch (e) {
            toast.error('Failed to process folder: ' + e.message);
        } finally {
            setIsSubmittingFolder(false);
        }
    };

    const handleDeleteFolder = async (id, e) => {
        e.stopPropagation(); // prevent navigation
        if (!window.confirm("Are you sure? Only empty folders can be deleted.")) return;
        try {
            await deleteFolder(id);
            toast.success("Folder deleted");
            setAllFolders(allFolders.filter(f => f.id !== id));
        } catch (e) {
            toast.error("Error: " + (e.message || "Cannot delete non-empty folder"));
        }
    };

    const handleMoveSubmit = async (e) => {
        e.preventDefault();
        if (!itemToMove) return;

        setIsMoving(true);
        try {
            if (itemToMove.type === 'file') {
                await moveFile(itemToMove.id, selectedDestinationFolder);
            } else {
                // Check if moving into itself or its own descendants (optional basic check)
                if (itemToMove.id === selectedDestinationFolder) {
                    throw new Error("Cannot move a folder into itself");
                }
                await moveFolder(itemToMove.id, { parent_id: selectedDestinationFolder });
            }
            toast.success(`${itemToMove.type === 'file' ? 'File' : 'Folder'} moved successfully`);
            setShowMoveModal(false);
            setItemToMove(null);
            fetchVaultData();
        } catch (e) {
            toast.error('Failed to move: ' + e.message);
        } finally {
            setIsMoving(false);
        }
    };

    // File Actions
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to securely delete this file?')) return;
        const previousFiles = [...allFiles];
        setAllFiles(allFiles.filter(f => f.id !== id));
        try {
            await deleteFile(id);
            toast.success("File securely deleted");
        } catch {
            setAllFiles(previousFiles);
            toast.error('Failed to delete file');
        }
    };

    const handleDownloadClick = (file) => {
        if (file.password_protected) {
            setPromptPasswordForId(file.id);
            setPromptAction('download');
            setDownloadPassword('');
        } else {
            executeDownload(file, null);
        }
    };

    const handleViewClick = (file) => {
        if (file.password_protected) {
            setPromptPasswordForId(file.id);
            setPromptAction('view');
            setDownloadPassword('');
        } else {
            executeView(file, null);
        }
    };

    const executeView = async (fileRec, password) => {
        if (!masterKey || !(masterKey instanceof CryptoKey)) {
            toast.error("Vault is locked. Unlock first.");
            return;
        }
        setViewingId(fileRec.id);
        const loadingToast = toast.loading("Decrypting securely...");
        try {
            setPromptPasswordForId(null);
            const encryptedBlob = await fetchFileBlob(fileRec.id);
            const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();

            const decryptedBuffer = await decryptFileFlow(
                encryptedArrayBuffer,
                fileRec.encrypted_file_key,
                fileRec.file_iv,
                fileRec.key_wrap_iv,
                masterKey,
                fileRec.password_protected,
                password,
                fileRec.password_salt,
                fileRec.password_iv
            );

            const mimeType = getMimeType(fileRec.decryptedName);
            const decryptedBlob = new Blob([decryptedBuffer], { type: mimeType });
            const url = window.URL.createObjectURL(decryptedBlob);

            setPreviewFile(fileRec);
            setPreviewUrl(url);

            toast.success("Decryption successful!", { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error('Decryption failed: ' + (e.message || 'Incorrect password or corrupted file'), { id: loadingToast });
            if (fileRec.password_protected) {
                setPromptPasswordForId(fileRec.id);
                setPromptAction('view');
            }
        } finally {
            setViewingId(null);
        }
    };

    const closePreview = () => {
        if (previewUrl) window.URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setPreviewFile(null);
    };

    const executeDownload = async (fileRec, password) => {
        if (!masterKey || !(masterKey instanceof CryptoKey)) {
            toast.error("Vault is locked. Unlock first.");
            return;
        }
        setDownloadingId(fileRec.id);
        const loadingToast = toast.loading("Decrypting securely...");
        try {
            setPromptPasswordForId(null);
            const encryptedBlob = await fetchFileBlob(fileRec.id);
            const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();

            const decryptedBuffer = await decryptFileFlow(
                encryptedArrayBuffer,
                fileRec.encrypted_file_key,
                fileRec.file_iv,
                fileRec.key_wrap_iv,
                masterKey,
                fileRec.password_protected,
                password,
                fileRec.password_salt,
                fileRec.password_iv
            );

            const decryptedBlob = new Blob([decryptedBuffer], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(decryptedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileRec.decryptedName;
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success("Decryption successful!", { id: loadingToast });
        } catch (e) {
            console.error(e);
            toast.error('Decryption failed: ' + (e.message || 'Incorrect password or corrupted file'), { id: loadingToast });
            if (fileRec.password_protected) {
                setPromptPasswordForId(fileRec.id); // re-prompt on fail
            }
        } finally {
            setDownloadingId(null);
        }
    };

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length > 0) {
            const f = acceptedFiles[0];
            if (f.size > 15 * 1024 * 1024) {
                toast.error("File size exceeds 15MB limit.");
                return;
            }
            setSelectedFile(f);
            setShowUploadModal(true);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop,
        maxSize: 15 * 1024 * 1024,
        noClick: true,
        noKeyboard: true
    });

    const resetUploadModal = () => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setUseFilePassword(false);
        setFilePassword('');
        setUploadStatus('');
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile) return;
        if (!masterKey || !(masterKey instanceof CryptoKey)) {
            toast.error("Vault is locked. Unlock first.");
            return;
        }
        if (useFilePassword && filePassword.length < 4) {
            toast.error('File password must be at least 4 characters');
            return;
        }

        try {
            setUploadStatus('encrypting');
            const payload = await encryptFileFlow(selectedFile, masterKey, useFilePassword ? filePassword : null);

            setUploadStatus('uploading');
            const formData = new FormData();
            formData.append('file', payload.encryptedFileBlob, "blob");
            formData.append('encrypted_file_key', payload.encryptedFileKey);
            formData.append('file_iv', payload.fileIv);
            formData.append('key_wrap_iv', payload.keyWrapIv);
            formData.append('encrypted_filename', payload.encryptedFilename);
            formData.append('filename_iv', payload.filenameIv);
            formData.append('requires_file_password', payload.requiresFilePassword);
            if (currentFolder) formData.append('folder_id', currentFolder);

            if (payload.requiresFilePassword) {
                formData.append('password_salt', payload.filePasswordSalt);
                formData.append('password_iv', payload.filePasswordIv);
            }
            formData.append('original_size', payload.originalSize);

            await uploadFile(formData);

            setUploadStatus('done');
            toast.success("File encrypted and stored!");
            fetchVaultData();
            setTimeout(() => resetUploadModal(), 1500);

        } catch (e) {
            console.error(e);
            setUploadStatus('');
            toast.error('Failed: ' + e.message);
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalSize = allFiles.reduce((acc, f) => acc + (f.file_size || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto px-8 py-10 min-h-[85vh] relative"
            {...getRootProps()}
        >
            <input {...getInputProps()} />

            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-indigo-500/10 backdrop-blur-sm border-2 border-indigo-500 border-dashed rounded-3xl flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-zinc-900 shadow-2xl p-8 rounded-full animate-bounce mt-20">
                            <UploadCloud className="w-16 h-16 text-indigo-400" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-2">
                        {currentFolder && (
                            <button onClick={() => setCurrentFolder(breadcrumbs[breadcrumbs.length - 2]?.id || null)} className="hover:bg-zinc-800 p-1.5 rounded-lg transition-colors mr-2 text-zinc-400">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        )}
                        Workspace
                    </h1>
                    <div className="flex items-center text-sm mt-3 text-zinc-500">
                        <button onClick={() => setCurrentFolder(null)} className="hover:text-indigo-400 transition-colors">Vault Root</button>
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                                <button onClick={() => setCurrentFolder(crumb.id)} className={`hover:text-indigo-400 transition-colors ${idx === breadcrumbs.length - 1 ? 'text-zinc-300 font-medium' : ''}`}>
                                    {crumb.decryptedName}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3 relative z-10">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setFolderAction('create'); setFolderName(''); setShowFolderModal(true); }}
                        disabled={!masterKey}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50"
                    >
                        <FolderPlus className="w-5 h-5 text-indigo-400" />
                        <span>New Folder</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openFileDialog}
                        disabled={!masterKey}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center space-x-2 disabled:opacity-50"
                    >
                        <UploadCloud className="w-5 h-5" />
                        <span>Upload File</span>
                    </motion.button>
                </div>
            </div>

            <div className="bg-zinc-900/10 rounded-3xl min-h-[50vh]">
                {loadingList ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : (currentFiles.length === 0 && currentFoldersList.length === 0) ? (
                    <div onClick={openFileDialog} className="flex flex-col items-center justify-center h-72 text-zinc-500 cursor-pointer border-2 border-dashed border-zinc-800/50 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-3xl transition-all group">
                        <div className="w-20 h-20 bg-zinc-800/30 group-hover:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                            <UploadCloud className="w-10 h-10 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-lg text-zinc-300 font-medium">This folder is empty</p>
                        <p className="text-sm mt-1">Drag and drop to upload securely</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {/* Render Folders First */}
                            {currentFoldersList.map((f, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                    transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                    key={`folder-${f.id}`}
                                    className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 hover:border-indigo-500/50 transition-all group overflow-hidden relative shadow-lg cursor-pointer"
                                    onClick={() => setCurrentFolder(f.id)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-3 truncate pr-4">
                                            <div className="p-3 bg-zinc-800 rounded-xl flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                                                <Folder className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-zinc-200 truncate" title={f.decryptedName}>{f.decryptedName}</p>
                                                <p className="text-xs text-zinc-500 mt-0.5">Folder</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 relative z-10 pt-4 mt-2 border-t border-zinc-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => { e.stopPropagation(); setItemToMove({ id: f.id, type: 'folder', name: f.decryptedName }); setSelectedDestinationFolder(null); setShowMoveModal(true); }}
                                            className="bg-zinc-800 hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-400 transition-colors py-1.5 px-3 flex items-center justify-center rounded-lg text-xs font-medium"
                                        >
                                            <CornerDownRight className="w-3.5 h-3.5 mr-1" /> Move
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => { e.stopPropagation(); setFolderAction(f.id); setFolderName(f.decryptedName); setShowFolderModal(true); }}
                                            className="bg-zinc-800 hover:bg-indigo-500 text-zinc-400 hover:text-white transition-colors py-1.5 px-3 flex items-center justify-center rounded-lg text-xs font-medium"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Rename
                                        </motion.button>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => handleDeleteFolder(f.id, e)}
                                            className="bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white transition-colors py-1.5 px-3 flex items-center justify-center rounded-lg text-xs font-medium"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Render Files */}
                            {currentFiles.map((f, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                    transition={{ duration: 0.3, delay: (currentFoldersList.length + index) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                    key={`file-${f.id}`}
                                    className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 hover:border-indigo-500/30 transition-all group overflow-hidden relative shadow-lg shadow-black/20"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3 truncate pr-4">
                                            <div className={"p-3 rounded-xl flex-shrink-0 " + (f.password_protected ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20") + " transition-colors"}>
                                                {f.password_protected ? <Lock className="w-5 h-5" /> : <File className="w-5 h-5" />}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-zinc-200 truncate" title={f.decryptedName}>{f.decryptedName}</p>
                                                <p className="text-xs text-zinc-500 mt-0.5">{formatBytes(f.file_size)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-xs text-zinc-600 mb-4 px-1">
                                        <Calendar className="w-3.5 h-3.5 mr-1" />
                                        {f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Unknown'}
                                    </div>

                                    {promptPasswordForId === f.id ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className="absolute inset-x-2 bottom-2 bg-zinc-950/95 p-3 flex flex-col justify-center border border-amber-500/30 rounded-xl z-10 backdrop-blur-md shadow-2xl"
                                        >
                                            <p className="text-[11px] text-amber-400 mb-2 font-medium uppercase tracking-wider">Secondary Password</p>
                                            <input
                                                type="password"
                                                placeholder="..."
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-sm px-3 py-2 text-zinc-200 mb-2 focus:border-amber-500 focus:outline-none"
                                                value={downloadPassword}
                                                onChange={e => setDownloadPassword(e.target.value)}
                                            />
                                            <div className="flex space-x-2">
                                                <button onClick={() => promptAction === 'view' ? executeView(f, downloadPassword) : executeDownload(f, downloadPassword)} className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-900 px-2 py-2 rounded-lg text-xs font-semibold transition-colors">Decrypt</button>
                                                <button onClick={() => setPromptPasswordForId(null)} className="p-2 text-zinc-500 hover:text-white bg-zinc-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex gap-2 relative z-0 mt-2">
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleViewClick(f)}
                                                disabled={viewingId === f.id}
                                                className="flex-1 bg-zinc-800 hover:bg-emerald-500 text-zinc-300 hover:text-white font-medium py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
                                            >
                                                {viewingId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Eye className="w-3.5 h-3.5" /><span>View</span></>}
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDownloadClick(f)}
                                                disabled={downloadingId === f.id}
                                                className="flex-1 bg-zinc-800 hover:bg-indigo-500 text-zinc-300 hover:text-white font-medium py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
                                            >
                                                {downloadingId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Download className="w-3.5 h-3.5" /><span>Save</span></>}
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setItemToMove({ id: f.id, type: 'file', name: f.decryptedName }); setSelectedDestinationFolder(null); setShowMoveModal(true); }}
                                                className="bg-zinc-800 hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-400 transition-colors py-2 px-3 flex items-center justify-center rounded-xl"
                                                title="Move File"
                                            >
                                                <CornerDownRight className="w-4 h-4" />
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDelete(f.id)}
                                                className="bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors py-2 px-3 flex items-center justify-center rounded-xl"
                                                title="Delete File"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* CREATE/RENAME FOLDER MODAL */}
            <AnimatePresence>
                {showFolderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmittingFolder && setShowFolderModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 p-6">
                            <h3 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
                                <FolderPlus className="w-5 h-5 text-indigo-400" />
                                {folderAction === 'create' ? 'Create Folder' : 'Rename Folder'}
                            </h3>
                            <form onSubmit={handleFolderSubmit}>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="Folder Name"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white mb-4 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={folderName}
                                    onChange={(e) => setFolderName(e.target.value)}
                                    disabled={isSubmittingFolder}
                                />
                                <div className="flex gap-3">
                                    <button onClick={() => setShowFolderModal(false)} type="button" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition-colors font-medium">Cancel</button>
                                    <button disabled={isSubmittingFolder || !folderName.trim()} type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-2.5 rounded-xl transition-colors font-medium disabled:opacity-50 flex justify-center">
                                        {isSubmittingFolder ? <Loader2 className="w-5 h-5 animate-spin" /> : (folderAction === 'create' ? 'Create' : 'Save')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MOVE MODAL */}
            <AnimatePresence>
                {showMoveModal && itemToMove && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isMoving && setShowMoveModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col max-h-[80vh]">
                            <h3 className="text-xl font-medium text-white mb-2 flex items-center gap-2">
                                <CornerDownRight className="w-5 h-5 text-indigo-400" />
                                Move Item
                            </h3>
                            <p className="text-sm text-zinc-400 mb-4 truncate">Moving: <span className="text-white font-medium">{itemToMove.name}</span></p>

                            <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-1 custom-scrollbar">
                                <button
                                    onClick={() => setSelectedDestinationFolder(null)}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${selectedDestinationFolder === null ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300' : 'bg-zinc-900 border border-transparent text-zinc-300 hover:bg-zinc-800'}`}
                                >
                                    <HardDrive className="w-5 h-5" />
                                    <span className="font-medium truncate">Vault Root</span>
                                </button>

                                {allFolders.filter(f => f.id !== itemToMove.id).map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => setSelectedDestinationFolder(folder.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${selectedDestinationFolder === folder.id ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300' : 'bg-zinc-900 border border-transparent text-zinc-300 hover:bg-zinc-800'}`}
                                    >
                                        <Folder className="w-5 h-5" />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-medium truncate">{folder.decryptedName}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-auto pt-2 border-t border-zinc-800/50">
                                <button onClick={() => setShowMoveModal(false)} type="button" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition-colors font-medium">Cancel</button>
                                <button onClick={handleMoveSubmit} disabled={isMoving} className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-2.5 rounded-xl transition-colors font-medium disabled:opacity-50 flex justify-center items-center">
                                    {isMoving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Move Here'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {previewUrl && previewFile && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={closePreview}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col"
                        >
                            <div className="flex justify-between items-center p-5 border-b border-zinc-900/50 bg-zinc-900/40">
                                <h3 className="text-lg font-medium text-white flex items-center gap-3 truncate pr-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <Eye className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                    </div>
                                    <span className="truncate">{previewFile.decryptedName}</span>
                                </h3>
                                <button onClick={closePreview} className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 bg-zinc-900 rounded-xl transition-colors flex-shrink-0 border border-zinc-800">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-zinc-950 min-h-[50vh]">
                                {getMimeType(previewFile.decryptedName).startsWith('image/') ? (
                                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl" />
                                ) : getMimeType(previewFile.decryptedName).startsWith('video/') ? (
                                    <video src={previewUrl} controls className="max-w-full max-h-[65vh] rounded-xl shadow-2xl" />
                                ) : getMimeType(previewFile.decryptedName) === 'application/pdf' ? (
                                    <iframe src={previewUrl} className="w-full h-[70vh] rounded-xl border-none bg-white" title="PDF Preview" />
                                ) : (
                                    <div className="text-zinc-500 flex flex-col items-center bg-zinc-900/50 p-10 rounded-3xl border border-zinc-800">
                                        <File className="w-20 h-20 mb-6 text-zinc-700" />
                                        <p className="text-lg text-zinc-300">No preview available for this file type.</p>
                                        <p className="text-sm text-zinc-500 mt-2 text-center max-w-xs">You might need an external application to open this format.</p>
                                        <div className="mt-8 flex gap-4">
                                            <a href={previewUrl} download={previewFile.decryptedName} className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-400 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                                                Download {previewFile.decryptedName.split('.').pop()?.toUpperCase()} File
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* UPLOAD MODAL */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => uploadStatus === '' && resetUploadModal()}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-zinc-900/50">
                                <h3 className="text-xl font-medium text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-500" />
                                    Encrypt & Upload
                                </h3>
                                <button onClick={resetUploadModal} disabled={uploadStatus !== ''} className="text-zinc-500 hover:text-white transition-colors disabled:opacity-50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    <div className="flex items-center space-x-4 bg-zinc-900 border border-zinc-800/80 p-4 rounded-xl">
                                        <div className="bg-indigo-500/20 p-3 rounded-xl"><File className="w-6 h-6 text-indigo-400" /></div>
                                        <div className="flex-1 truncate">
                                            <p className="text-zinc-200 text-sm font-medium truncate">{selectedFile.name}</p>
                                            <p className="text-zinc-500 text-xs">{formatBytes(selectedFile.size)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50">
                                        <label className="flex items-center space-x-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${useFilePassword ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-zinc-950 border-zinc-700 text-transparent group-hover:border-zinc-500'}`}>
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={useFilePassword}
                                                onChange={e => setUseFilePassword(e.target.checked)}
                                                className="hidden"
                                                disabled={uploadStatus !== ''}
                                            />
                                            <span className="text-sm font-medium text-zinc-300">Add isolated password</span>
                                        </label>

                                        <AnimatePresence>
                                            {useFilePassword && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                                        <input
                                                            type="password"
                                                            placeholder="File decryption password"
                                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl text-sm px-4 py-3 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors shadow-inner"
                                                            value={filePassword}
                                                            onChange={e => setFilePassword(e.target.value)}
                                                            disabled={uploadStatus !== ''}
                                                        />
                                                        <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                                                            <Lock className="w-3 h-3" /> Will be required to download
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="pt-2">
                                        {uploadStatus === '' ? (
                                            <button
                                                onClick={handleUploadSubmit}
                                                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                                            >
                                                Start Secure Transfer {currentFolder && 'to Folder'}
                                            </button>
                                        ) : (
                                            <div className="w-full bg-zinc-900 border border-zinc-800 py-3.5 rounded-xl flex flex-col items-center justify-center space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    {['encrypting', 'uploading'].includes(uploadStatus) && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
                                                    {uploadStatus === 'done' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                                    <span className={`text-sm font-medium ${uploadStatus === 'done' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                                        {uploadStatus === 'encrypting' && 'Zero-knowledge encryption...'}
                                                        {uploadStatus === 'uploading' && 'Transferring blob...'}
                                                        {uploadStatus === 'done' && 'Secured in Vault!'}
                                                    </span>
                                                </div>
                                                <div className="w-2/3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full ${uploadStatus === 'done' ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                                                        initial={{ width: uploadStatus === 'encrypting' ? '10%' : '50%' }}
                                                        animate={{ width: uploadStatus === 'done' ? '100%' : uploadStatus === 'uploading' ? '70%' : '30%' }}
                                                        transition={{ duration: 1 }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
