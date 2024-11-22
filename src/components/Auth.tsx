import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function AuthComponent({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (isNewUser) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            full_name: `${firstName} ${lastName}`
                        }
                    }
                });

                if (error) throw error;
                setMessage('Success! Please check your email to confirm your account.');
                setTimeout(onClose, 2000); // Close after 2 seconds

            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        setIsNewUser(true);
                    } else {
                        throw error;
                    }
                } else {
                    setMessage('Successfully signed in!');
                    setTimeout(onClose, 1500); // Close after 1.5 seconds
                }
            }
        } catch (error: any) {
            setMessage(error.message);
        }
    };

    return (
        <div className="space-y-4">
            {message && (
                <div className={`p-3 rounded text-center ${
                    message.includes('Success') 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
                {isNewUser ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <Input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <Input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </>
                ) : null}
                
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" className="w-full">
                    {isNewUser ? 'Sign Up' : 'Sign In'}
                </Button>

                <div className="text-center text-sm">
                    <button
                        type="button"
                        onClick={() => setIsNewUser(!isNewUser)}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        {isNewUser ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </form>
        </div>
    );
} 